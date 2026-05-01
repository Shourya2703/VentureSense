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
# Fetch dataset
data = fetch_openml(data_id=46962, as_frame=True)
df = data.frame

# Extract target (Bankrupt) before imputation
# Target values are 'Yes' and 'No'
target = (df['Bankrupt'] == 'Yes').astype(int)

# Handle missing values (impute with median for numeric columns)
numeric_cols = df.select_dtypes(include=[np.number]).columns
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

# Engineer Startup-like features using the real financial ratios
# We'll use scaling to make them look like real dollar amounts
np.random.seed(42)

# Using Revenue_Per_Share as proxy for revenue base
revenue_base = df['Revenue_Per_Share'].replace(0, 0.001)

df['monthly_revenue'] = revenue_base * 1000000
df['monthly_expenses'] = df['monthly_revenue'] * (1 + df['Total_Expense_to_Assets'])
df['burn_rate'] = df['monthly_expenses'] - df['monthly_revenue']

# Runway months = Cash / monthly burn (if burn > 0)
# We use Cash_to_Total_Assets as a proxy for cash
cash = df['Cash_to_Total_Assets'] * 10000000
df['runway_months'] = np.where(df['burn_rate'] > 0, cash / df['burn_rate'], 36.0)
df['runway_months'] = np.clip(df['runway_months'], 0, 36)

df['customer_growth_rate'] = df['Total_Asset_Growth_Rate'] - 1.0 # Centered around 0

# Churn rate: Inverse relation with Net Income + noise
df['churn_rate'] = np.clip(0.1 - df['Net_Income_to_Total_Assets'] * 0.1 + np.random.normal(0, 0.05, len(df)), 0.01, 0.5)

df['funding_amount'] = df['Net_Value_Per_Share_A'] * 500000

# Select the features for our model (Combining engineered + real ratios)
features = [
    'monthly_revenue',
    'monthly_expenses',
    'burn_rate',
    'runway_months',
    'customer_growth_rate',
    'churn_rate',
    'funding_amount',
    'Debt_Ratio_Percent',
    'Cash_to_Total_Assets',
    'Net_Income_to_Total_Assets'
]

X = df[features]
y = target

# Preprocessing: Normalize features
scaler = StandardScaler()
X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

print("Training XGBoost model...")
# Calculate scale_pos_weight since bankruptcy is highly imbalanced
scale_pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)

model = xgb.XGBClassifier(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=5,
    scale_pos_weight=scale_pos_weight,
    random_state=42,
    eval_metric='logloss'
)

model.fit(X_train, y_train)

# Evaluation
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

metrics = {
    'roc_auc': float(roc_auc_score(y_test, y_proba)),
    'accuracy': float(accuracy_score(y_test, y_pred)),
    'precision': float(precision_score(y_test, y_pred)),
    'recall': float(recall_score(y_test, y_pred))
}

print(f"Metrics: {metrics}")

# Explainability (SHAP)
print("Calculating SHAP values...")
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

feature_importance = np.abs(shap_values).mean(axis=0)
importance_df = pd.DataFrame({
    'feature': X.columns,
    'importance': feature_importance
}).sort_values(by='importance', ascending=False)

impact_direction = []
for i, col in enumerate(X.columns):
    std_feature = np.std(X_test[col])
    std_shap = np.std(shap_values[:, i])
    if std_feature > 0 and std_shap > 0:
        corr = np.corrcoef(X_test[col], shap_values[:, i])[0, 1]
        impact_direction.append("positive" if corr > 0 else "negative")
    else:
        impact_direction.append("neutral")

importance_df['impact_on_failure'] = impact_direction
feature_importance_list = importance_df.to_dict('records')

# Save artifacts
os.makedirs('model_artifacts', exist_ok=True)
joblib.dump(model, 'model_artifacts/xgboost_model.joblib')
joblib.dump(explainer, 'model_artifacts/shap_explainer.joblib')
joblib.dump(scaler, 'model_artifacts/scaler.joblib')

with open('model_artifacts/metrics.json', 'w') as f:
    json.dump(metrics, f)

with open('model_artifacts/feature_importance.json', 'w') as f:
    json.dump(feature_importance_list, f)

print("Training complete. Artifacts saved to model_artifacts/")
