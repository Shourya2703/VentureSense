import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score
from sklearn.datasets import fetch_openml
import joblib
import json
import shap
import os

print("Fetching Taiwanese Bankruptcy dataset from OpenML...")
data = fetch_openml(data_id=46962, as_frame=True)
df = data.frame

target = (df['Bankrupt'] == 'Yes').astype(int)

numeric_cols = df.select_dtypes(include=[np.number]).columns
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

np.random.seed(42)

revenue_base = df['Revenue_Per_Share'].replace(0, 0.001)

df['monthly_revenue'] = revenue_base * 1000000
df['monthly_expenses'] = df['monthly_revenue'] * (1 + df['Total_Expense_to_Assets'])
df['burn_rate'] = df['monthly_expenses'] - df['monthly_revenue']

cash = df['Cash_to_Total_Assets'] * 10000000
df['runway_months'] = np.where(df['burn_rate'] > 0, cash / df['burn_rate'], 36.0)
df['runway_months'] = np.clip(df['runway_months'], 0, 36)

df['customer_growth_rate'] = df['Total_Asset_Growth_Rate'] - 1.0 
df['churn_rate'] = np.clip(0.1 - df['Net_Income_to_Total_Assets'] * 0.1 + np.random.normal(0, 0.05, len(df)), 0.01, 0.5)
df['funding_amount'] = df['Net_Value_Per_Share_A'] * 500000

df['burn_ratio'] = df['monthly_expenses'] / (df['monthly_revenue'] + 1)
df['runway_risk'] = 1.0 / (df['runway_months'] + 0.1)
efficiency = df['monthly_revenue'] / (df['monthly_expenses'] + 1)
runway_norm = df['runway_months'] / 36.0
df['survival_score'] = (0.6 * efficiency) + (0.4 * runway_norm)
df['extreme_risk_flag'] = ((df['runway_months'] < 3) | (df['churn_rate'] > 0.4)).astype(int)
df['efficiency_score'] = efficiency
df['profit_flag'] = (df['monthly_revenue'] > df['monthly_expenses']).astype(int)
df['revenue_strength'] = np.log1p(df['monthly_revenue'] / 100000)
df['revenue_trend'] = 1.0 + (df['Total_Asset_Growth_Rate'] - 1.0)
df['expense_trend'] = 1.0 + (df['Debt_Ratio_Percent'] / 100.0)

df['burn_to_funding_ratio'] = df['burn_rate'] / (df['funding_amount'] + 1)
df['growth_efficiency'] = df['customer_growth_rate'] * df['efficiency_score']
df['churn_burn_multiplier'] = df['churn_rate'] * df['burn_ratio']
df['funding_runway_impact'] = np.log1p(df['funding_amount'] / 1000000) * (df['runway_months'] / 12)

features = [
    'monthly_revenue', 'monthly_expenses', 'burn_rate', 'runway_months',
    'burn_ratio', 'runway_risk', 'survival_score', 'extreme_risk_flag',
    'efficiency_score', 'profit_flag', 'revenue_strength', 'revenue_trend',
    'expense_trend', 'burn_to_funding_ratio', 'growth_efficiency', 
    'churn_burn_multiplier', 'funding_runway_impact',
    'customer_growth_rate', 'churn_rate', 'funding_amount',
    'Debt_Ratio_Percent', 'Cash_to_Total_Assets', 'Net_Income_to_Total_Assets'
]

X = df[features]
y = target

print("Generating high-fidelity synthetic data...")
synthetic_samples = []

for _ in range(1500):
    rev = np.random.uniform(0, 10000000)
    exp = np.random.uniform(100000, 5000000)
    runway = np.random.uniform(0, 24)
    growth = np.random.uniform(-0.2, 0.5)
    churn = np.random.uniform(0, 0.5)
    funding = np.random.uniform(0, 200000000)
    
    burn = max(0, exp - rev)
    eff = rev / (exp + 1)
    
    risk_score = 0
    if runway < 6: risk_score += 0.4
    if eff < 0.8: risk_score += 0.2
    if churn > 0.2: risk_score += 0.2
    if growth < 0: risk_score += 0.2
    if burn > (funding / 12): risk_score += 0.2
    
    target_val = 1 if risk_score > 0.6 else 0
    
    synthetic_samples.append({
        'monthly_revenue': rev, 'monthly_expenses': exp, 'burn_rate': burn,
        'runway_months': runway, 'burn_ratio': exp / (rev + 1), 'runway_risk': 1.0 / (runway + 0.1),
        'survival_score': (0.6 * eff) + (0.4 * (runway / 36.0)), 
        'extreme_risk_flag': 1 if (runway < 3 or churn > 0.4) else 0,
        'efficiency_score': eff, 'profit_flag': 1 if rev > exp else 0,
        'revenue_strength': np.log1p(rev / 100000),
        'revenue_trend': 1.0 + (growth / 2), 'expense_trend': 1.0 + (churn / 5),
        'burn_to_funding_ratio': burn / (funding + 1),
        'growth_efficiency': growth * eff,
        'churn_burn_multiplier': churn * (exp / (rev + 1)),
        'funding_runway_impact': np.log1p(funding / 1000000) * (runway / 12),
        'customer_growth_rate': growth, 'churn_rate': churn, 'funding_amount': funding,
        'Debt_Ratio_Percent': np.random.uniform(10, 90), 
        'Cash_to_Total_Assets': np.random.uniform(0.01, 0.6), 
        'Net_Income_to_Total_Assets': np.random.uniform(-0.4, 0.4),
        'target': target_val
    })

df_synth = pd.DataFrame(synthetic_samples)
X = pd.concat([X, df_synth[features]], ignore_index=True)
y = pd.concat([y, df_synth['target']], ignore_index=True)

X_train_full, X_test, y_train_full, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
X_train, X_calib, y_train, y_calib = train_test_split(X_train_full, y_train_full, test_size=0.1, random_state=42, stratify=y_train_full)

print("Training responsive XGBoost ensemble...")
from sklearn.calibration import CalibratedClassifierCV

base_model = xgb.XGBClassifier(
    n_estimators=200,       
    learning_rate=0.05,     
    max_depth=4,            
    min_child_weight=5,     
    subsample=0.8,
    colsample_bytree=0.7,
    reg_alpha=0.5,          
    reg_lambda=2.0,         
    random_state=42,
    eval_metric='logloss'
)
base_model.fit(X_train, y_train)

print("Applying cross-validated isotonic calibration...")
model = CalibratedClassifierCV(base_model, method='isotonic', cv=3)
model.fit(X_train_full, y_train_full)


y_proba = model.predict_proba(X_test)[:, 1]
y_pred_tuned = (y_proba >= 0.45).astype(int)

print(f"\nPrediction Distribution on Test Set:")
print(f"  Min: {y_proba.min():.4f}")
print(f"  Max: {y_proba.max():.4f}")
print(f"  Mean: {y_proba.mean():.4f}")
print(f"  Std: {y_proba.std():.4f}")
print(f"  Quartiles: {np.percentile(y_proba, [25, 50, 75])}")

metrics = {
    'roc_auc': float(roc_auc_score(y_test, y_proba)),
    'accuracy': float(accuracy_score(y_test, y_pred_tuned)),
    'precision': float(precision_score(y_test, y_pred_tuned)),
    'recall': float(recall_score(y_test, y_pred_tuned)),
    'threshold': 0.45
}

print(f"\nMetrics (Threshold 0.45): {metrics}")

print("Extracting feature importance...")
feature_importance = base_model.feature_importances_

importance_df = pd.DataFrame({
    'feature': X.columns,
    'importance': feature_importance
}).sort_values(by='importance', ascending=False)

impact_direction = []
for col in X.columns:
    corr = np.corrcoef(X_train[col], y_train)[0, 1]
    if abs(corr) < 0.01:
        impact_direction.append("neutral")
    elif corr > 0:
        impact_direction.append("positive")
    else:
        impact_direction.append("negative")

importance_df['impact_on_failure'] = impact_direction
feature_importance_list = importance_df.to_dict('records')

print(f"\nTop 5 Features:")
for item in feature_importance_list[:5]:
    print(f"  {item['feature']}: {item['importance']:.4f} ({item['impact_on_failure']})")

os.makedirs('model_artifacts', exist_ok=True)
joblib.dump(model, 'model_artifacts/xgboost_model.joblib')

with open('model_artifacts/features.json', 'w') as f:
    json.dump(features, f)

with open('model_artifacts/metrics.json', 'w') as f:
    json.dump(metrics, f)

with open('model_artifacts/feature_importance.json', 'w') as f:
    json.dump(feature_importance_list, f)

print("\nTraining complete. Artifacts saved to model_artifacts/")
