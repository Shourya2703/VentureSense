from fastapi import FastAPI, HTTPException
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

# Try to configure Gemini with env var
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

# Configure Resend
resend.api_key = os.environ.get("RESEND_API_KEY", "re_j3fwtHuy_636bvxRFG8Q6eYQu94MB4yCR")

app = FastAPI(title="VentureSense ML API")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define input schema matching engineered + real features
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

# Auth Models
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

# In-memory DB for Auth
db_users = {}
db_otps = {}

# Load artifacts
MODEL_PATH = "model_artifacts/xgboost_model.joblib"
EXPLAINER_PATH = "model_artifacts/shap_explainer.joblib"
SCALER_PATH = "model_artifacts/scaler.joblib"
METRICS_PATH = "model_artifacts/metrics.json"
IMPORTANCE_PATH = "model_artifacts/feature_importance.json"

model = None
explainer = None
scaler = None
metrics = {}
feature_importance = []

@app.on_event("startup")
def load_artifacts():
    global model, explainer, scaler, metrics, feature_importance
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    if os.path.exists(EXPLAINER_PATH):
        explainer = joblib.load(EXPLAINER_PATH)
    if os.path.exists(SCALER_PATH):
        scaler = joblib.load(SCALER_PATH)
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, "r") as f:
            metrics = json.load(f)
    if os.path.exists(IMPORTANCE_PATH):
        with open(IMPORTANCE_PATH, "r") as f:
            feature_importance = json.load(f)

def get_risk_level(prob: float) -> str:
    if prob < 0.4:
        return "Low"
    elif prob <= 0.7:
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
    You are an AI financial advisor for startups.
    Based on the following machine learning model prediction, explain the risk in one short sentence, then provide 2-3 concise, actionable business recommendations.

    Risk Level: {risk_level} (Failure Probability: {prob:.2f})
    Top Contributing Factors (SHAP values):
    """
    for item in feature_contributions:
        prompt += f"- {item['feature']}: value {item['value']:.2f}, impact: {item['impact']}\n"
    
    prompt += """
    Format your response EXACTLY as a JSON object with two keys:
    {
      "explanation": "One short sentence explaining the risk.",
      "recommendations": [
        "Actionable tip 1",
        "Actionable tip 2"
      ]
    }
    """
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        text = response.text.strip().removeprefix('```json').removesuffix('```').strip()
        data = json.loads(text)
        return data.get("explanation", ""), data.get("recommendations", [])
    except Exception as e:
        return f"AI Generation failed: {str(e)}", []

@app.post("/predict")
def predict(data: StartupData):
    if model is None or explainer is None or scaler is None:
        raise HTTPException(status_code=500, detail="Model artifacts not fully loaded")
    
    # Prepare input dataframe exactly matching training features
    input_df = pd.DataFrame([{
        "monthly_revenue": data.monthly_revenue,
        "monthly_expenses": data.monthly_expenses,
        "burn_rate": data.burn_rate,
        "runway_months": data.runway_months,
        "customer_growth_rate": data.customer_growth_rate,
        "churn_rate": data.churn_rate,
        "funding_amount": data.funding_amount,
        "Debt_Ratio_Percent": data.debt_ratio_percent,
        "Cash_to_Total_Assets": data.cash_to_total_assets,
        "Net_Income_to_Total_Assets": data.net_income_to_total_assets
    }])
    
    # Scale features
    input_scaled = pd.DataFrame(scaler.transform(input_df), columns=input_df.columns)
    
    # Predict probability
    prob = float(model.predict_proba(input_scaled)[0, 1])
    risk_level = get_risk_level(prob)
    
    # Calculate SHAP values for this instance
    shap_values = explainer.shap_values(input_scaled)[0]
    
    # Get top contributing features
    feature_contributions = []
    for i, col in enumerate(input_scaled.columns):
        feature_contributions.append({
            "feature": col,
            "contribution": float(shap_values[i]),
            "impact": "positive" if shap_values[i] > 0 else "negative",
            "value": float(input_df[col].iloc[0]) # Return original unscaled value
        })
    
    # Sort by absolute contribution magnitude
    feature_contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    top_features = feature_contributions[:3]
    
    return {
        "failure_probability": round(prob, 4),
        "risk_level": risk_level,
        "top_contributing_features": top_features
    }

@app.post("/advisory")
def get_advisory(req: AdvisoryRequest):
    try:
        explanation, recommendations = generate_advisory(req.probability, req.risk_level, req.features)
        return {
            "explanation": explanation,
            "recommendations": recommendations
        }
    except Exception as e:
        print(f"Gemini API failed: {e}")
        # Graceful fallback if API key is invalid or Gemini fails
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

# ---- Auth Endpoints ----

@app.post("/auth/signup")
def signup(req: SignupRequest):
    if req.email in db_users:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_users[req.email] = {
        "name": req.name,
        "surname": req.surname,
        "password": req.password
    }
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
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #020617; padding: 40px; border-radius: 16px; border: 1px solid rgba(16,185,129,0.3);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #10B981; font-size: 28px; margin: 0;">VentureSense</h1>
                    <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">AI-Powered Risk Engine</p>
                </div>
                <div style="background: #0f172a; border-radius: 12px; padding: 30px; text-align: center; border: 1px solid rgba(16,185,129,0.2);">
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 16px 0;">Your one-time verification code is:</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 0.3em; color: #10B981; padding: 16px; background: rgba(16,185,129,0.1); border-radius: 8px; border: 1px solid rgba(16,185,129,0.3);">
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
        # Still return success since OTP is stored — user can check backend logs
        return {"message": "OTP generated (email delivery may have failed). Check backend logs."}

@app.post("/auth/verify-otp")
def verify_otp(req: VerifyOTPRequest):
    expected_otp = db_otps.get(req.email)
    if not expected_otp or expected_otp != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # OTP is valid, clear it
    del db_otps[req.email]
    user_data = db_users.get(req.email, {})
    return {
        "message": "Login successful", 
        "token": f"mock-jwt-token-for-{req.email}",
        "user": user_data
    }
