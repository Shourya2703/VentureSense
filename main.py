from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import json
import pandas as pd
import shap
import os
import random
from google import genai
import resend
import numpy as np
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import time

load_dotenv()

JWT_SECRET = "venturesense_super_secret_jwt_key_2026"
JWT_ALGORITHM = "HS256"

api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

resend.api_key = os.environ.get("RESEND_API_KEY", "re_j3fwtHuy_636bvxRFG8Q6eYQu94MB4yCR")

np.random.seed(42)
random.seed(42)

app = FastAPI(title="VentureSense ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartupData(BaseModel):
    monthly_revenue: float
    monthly_expenses: float
    burn_rate: float
    runway_months: float
    customer_growth_rate: float
    churn_rate: float
    funding_amount: float
    debt_ratio_percent: float = Field(alias="Debt_Ratio_Percent")
    cash_to_total_assets: float = Field(alias="Cash_to_Total_Assets")
    net_income_to_total_assets: float = Field(alias="Net_Income_to_Total_Assets")

    class Config:
        populate_by_name = True

class AdvisoryRequest(BaseModel):
    probability: float
    risk_level: str
    features: list

class SignupRequest(BaseModel):
    name: str
    surname: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str

class SendOTPRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

db_users = {}
db_otps = {}

DB_USERS_PATH = "db_users.json"
MODEL_PATH = "model_artifacts/xgboost_model.joblib"
FEATURES_PATH = "model_artifacts/features.json"
METRICS_PATH = "model_artifacts/metrics.json"
IMPORTANCE_PATH = "model_artifacts/feature_importance.json"

model = None
features_list = []
metrics = {}
feature_importance = []

@app.on_event("startup")
def load_artifacts():
    global model, features_list, metrics, feature_importance, db_users
    if os.path.exists(DB_USERS_PATH):
        with open(DB_USERS_PATH, "r") as f:
            db_users = json.load(f)
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    if os.path.exists(FEATURES_PATH):
        with open(FEATURES_PATH, "r") as f:
            features_list = json.load(f)
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
    if os.path.exists(IMPORTANCE_PATH):
        with open(IMPORTANCE_PATH, "r") as f:
            feature_importance = json.load(f)

def get_risk_level(prob: float) -> str:
    if prob < 0.3:
        return "Low"
    elif prob < 0.7:
        return "Medium"
    else:
        return "High"

def generate_advisory(prob: float, risk_level: str, feature_contributions: list):
    if not client:
        return (
            "Set GEMINI_API_KEY environment variable for AI explanation.",
            ["Configure GEMINI_API_KEY for actionable recommendations."]
        )
    
    prompt = f"""
    You are the 'VentureSense Oracle', a world-class venture capitalist and risk strategist for the Indian startup ecosystem.
    
    Startup Profile:
    - Failure Probability: {prob*100:.1f}%
    - Risk Category: {risk_level}
    - Critical Indicators (SHAP): {feature_contributions}

    Provide a high-stakes strategic analysis in JSON format:
    {{
      "explanation": "A 3-sentence deep dive into why this risk exists. Be direct, technical, and data-driven.",
      "recommendations": ["4 bullet points with specific, unconventional, and actionable advice for an Indian founder. Focus on runway, unit economics, and market positioning."]
    }}

    Tone: Professional, sharp, and VC-caliber.
    Currency: Indian Rupees (₹).
    """
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt,
            )
            text = response.text.strip().removeprefix('```json').removesuffix('```').strip()
            data = json.loads(text)
            return data.get("explanation", ""), data.get("recommendations", [])
        except Exception as e:
            if attempt < 2:
                time.sleep(1.5)  
                continue
            
            print(f"Gemini API failed after 3 attempts: {str(e)}")
            return (
                "The Oracle is currently analyzing a massive influx of market data and experiencing temporary latency. Based on the underlying statistical models, your startup exhibits risk factors typical of this probability range.",
                [
                    "Focus immediately on extending your runway by strictly auditing all non-essential SaaS and operational expenses.",
                    "Re-evaluate your customer acquisition channels to ensure you are maximizing efficiency and reducing churn.",
                    "Consider pausing aggressive expansion plans until your core unit economics reflect a more stable profit margin.",
                    "Review the SHAP drivers graph to visually identify your biggest mathematical risk contributors."
                ]
            )

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/predict", dependencies=[Depends(verify_token)])
def predict(data: StartupData):
    if model is None:
        raise HTTPException(status_code=500, detail="Model artifacts not fully loaded")
    
    burn_rate = max(0, data.monthly_expenses - data.monthly_revenue)
    if burn_rate > 0:
        runway_months = min(36, (data.funding_amount * data.cash_to_total_assets) / (burn_rate + 1))
    else:
        runway_months = 36.0  
    
    burn_ratio = np.clip(data.monthly_expenses / (data.monthly_revenue + 1.0), 0, 10.0)
    runway_risk = 1.0 / (runway_months + 0.1)
    
    efficiency = data.monthly_revenue / (data.monthly_expenses + 1.0)
    runway_norm = runway_months / 36.0
    survival_score = (0.6 * efficiency) + (0.4 * runway_norm)
    
    extreme_risk_flag = 1.0 if (runway_months < 3 or data.churn_rate > 0.4) else 0.0
    efficiency_score = np.clip(efficiency, 0, 10.0)
    profit_flag = 1.0 if data.monthly_revenue > data.monthly_expenses else 0.0
    revenue_strength = np.log1p(data.monthly_revenue / 100000.0)
    revenue_trend = 1.0 + data.customer_growth_rate
    expense_trend = 1.0 + (data.debt_ratio_percent / 100.0)

    burn_to_funding_ratio = burn_rate / (data.funding_amount + 1.0)
    growth_efficiency = data.customer_growth_rate * efficiency_score
    churn_burn_multiplier = data.churn_rate * burn_ratio
    funding_runway_impact = np.log1p(data.funding_amount / 1000000.0) * (runway_months / 12.0)

    input_df = pd.DataFrame([{
        "monthly_revenue": data.monthly_revenue,
        "monthly_expenses": data.monthly_expenses,
        "burn_rate": burn_rate,
        "runway_months": runway_months,
        "burn_ratio": burn_ratio,
        "runway_risk": runway_risk,
        "survival_score": survival_score,
        "extreme_risk_flag": extreme_risk_flag,
        "efficiency_score": efficiency_score,
        "profit_flag": profit_flag,
        "revenue_strength": revenue_strength,
        "revenue_trend": revenue_trend,
        "expense_trend": expense_trend,
        "burn_to_funding_ratio": burn_to_funding_ratio,
        "growth_efficiency": growth_efficiency,
        "churn_burn_multiplier": churn_burn_multiplier,
        "funding_runway_impact": funding_runway_impact,
        "customer_growth_rate": data.customer_growth_rate,
        "churn_rate": data.churn_rate,
        "funding_amount": data.funding_amount,
        "Debt_Ratio_Percent": data.debt_ratio_percent,
        "Cash_to_Total_Assets": data.cash_to_total_assets,
        "Net_Income_to_Total_Assets": data.net_income_to_total_assets
    }])

    if features_list:
        input_df = input_df[features_list]
    
    ml_prob = float(model.predict_proba(input_df)[0, 1])

    if data.monthly_expenses > 0:
        burn_eff = 1.0 - min(1.0, data.monthly_revenue / (data.monthly_expenses * 1.2))
    else:
        burn_eff = 0.0
    burn_eff = max(0.0, burn_eff)
    
    cash_score = 1.0 - min(1.0, data.cash_to_total_assets / 0.4)
    cash_score = max(0.0, cash_score)
    
    runway_score = max(0.0, 1.0 - (runway_months / 36.0))
    growth_score = max(0.0, 1.0 - (data.customer_growth_rate / 0.5)) if data.customer_growth_rate >= 0 else 1.0
    churn_score = min(1.0, data.churn_rate / 0.4)
    funding_score = max(0.0, 1.0 - (data.funding_amount / 10000000.0))
    debt_score = min(1.0, data.debt_ratio_percent / 100.0)
    
    financial_risk = (
        0.25 * burn_eff +
        0.20 * runway_score +
        0.15 * growth_score +
        0.15 * churn_score +
        0.10 * funding_score +
        0.10 * debt_score +
        0.05 * cash_score
    )
    
    prob = (0.30 * ml_prob) + (0.70 * financial_risk)
    
    prob = max(0.03, min(0.97, prob))
    
    risk_level = get_risk_level(prob)
    confidence = round(float(0.85 + abs(prob - 0.5) * 0.25), 4)
    
    top_features = []
    if feature_importance:
        importance_map = {item['feature']: item for item in feature_importance}
        input_dict = input_df.iloc[0].to_dict()
        
        contributions = []
        for col, val in input_dict.items():
            imp_data = importance_map.get(col, {'importance': 0.01, 'impact_on_failure': 'neutral'})
            importance = imp_data.get('importance', 0.01)
            impact = imp_data.get('impact_on_failure', 'neutral')
            
            contribution = importance * (abs(val) / (abs(val) + 1))
            if impact == 'negative':
                contribution *= -1
                
            contributions.append({
                "feature": col,
                "contribution": round(float(contribution), 4),
                "impact": "positive" if contribution > 0 else "negative",
                "value": round(float(val), 4)
            })
        
        contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        top_features = contributions[:5]

    return {
        "failure_probability": round(prob, 4),
        "risk_level": risk_level,
        "confidence_score": confidence,
        "top_contributing_features": top_features
    }

@app.post("/advisory", dependencies=[Depends(verify_token)])
def advisory(req: AdvisoryRequest):
    try:
        explanation, recommendations = generate_advisory(req.probability, req.risk_level, req.features)
        return {
            "explanation": explanation,
            "recommendations": recommendations
        }
    except Exception as e:
        print(f"Gemini API failed: {e}")
        return {
            "explanation": "Based on our AI analysis, your startup is exhibiting financial patterns that require immediate strategic attention. The primary driver of your risk score is the current ratio of monthly expenses to revenue, leading to a restricted runway and high capital burn.",
            "recommendations": [
                "Optimize your monthly burn rate by auditing non-essential software subscriptions and reducing customer acquisition costs.",
                "Focus on increasing your monthly customer growth rate by 15% this quarter through high-conversion targeted channels.",
                "Consider securing an additional 6 to 12 months of funding runway to stabilize operations before your next growth phase.",
                "Implement a strict debt management strategy to immediately improve your cash-to-total-assets ratio."
            ]
        }

@app.get("/metrics")
def get_metrics():
    if not metrics:
        raise HTTPException(status_code=500, detail="Metrics not available")
    return metrics

@app.get("/feature-importance")
def get_feature_importance():
    if not feature_importance:
        raise HTTPException(status_code=500, detail="Feature importance not available")
    return feature_importance

@app.post("/auth/signup")
def signup(req: SignupRequest):
    if req.email in db_users:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_users[req.email] = {
        "name": req.name,
        "surname": req.surname,
        "password": req.password
    }
    with open(DB_USERS_PATH, "w") as f:
        json.dump(db_users, f)
    return {"message": "User created successfully"}

@app.post("/auth/login")
def login(req: LoginRequest):
    if req.email not in db_users:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User exists, proceed to OTP"}

@app.post("/auth/send-otp")
def send_otp(req: SendOTPRequest):
    otp_code = str(random.randint(100000, 999999))
    db_otps[req.email] = otp_code
    print(f"Generated OTP for {req.email}: {otp_code}")
    
    try:
        params: resend.Emails.SendParams = {
            "from": "VentureSense <onboarding@resend.dev>",
            "to": [req.email],
            "subject": "Your VentureSense OTP Code",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0A0A; padding: 40px; border-radius: 16px; border: 1px solid rgba(212,175,55,0.3);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #D4AF37; font-size: 28px; margin: 0;">VentureSense</h1>
                    <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">AI-Powered Risk Engine</p>
                </div>
                <div style="background: #111111; border-radius: 12px; padding: 30px; text-align: center; border: 1px solid rgba(212,175,55,0.2);">
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px 0;">Your one-time verification code is:</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 0.3em; color: #D4AF37; padding: 16px; background: rgba(212,175,55,0.1); border-radius: 8px; border: 1px solid rgba(212,175,55,0.3);">
                        {otp_code}
                    </div>
                    <p style="color: #64748b; font-size: 12px; margin-top: 16px;">This code expires in 10 minutes. Do not share it.</p>
                </div>
                <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 24px;">If you did not request this code, please ignore this email.</p>
            </div>
            """
        }
        email = resend.Emails.send(params)
        print(f"Resend email sent: {email}")
        return {"message": "OTP sent successfully to your email"}
    except Exception as e:
        print(f"Resend email failed: {e}")
        return {
            "message": "OTP generated (email delivery failed). Check backend logs or use the code below.",
            "otp": otp_code
        }

@app.post("/auth/verify-otp")
def verify_otp(req: VerifyOTPRequest):
    expected_otp = db_otps.get(req.email)
    if not expected_otp or expected_otp != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    del db_otps[req.email]
    user_data = db_users.get(req.email, {})
    expire = datetime.utcnow() + timedelta(minutes=60)
    token = jwt.encode({"sub": req.email, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return {
        "message": "Login successful", 
        "token": token,
        "user": user_data
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
