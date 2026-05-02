# VentureSense | Premier Startup Risk Intelligence

VentureSense is a production-grade, full-stack risk assessment platform designed for high-stakes venture capital environments. It combines **Extreme Gradient Boosting (XGBoost)** machine learning with a **Hybrid Financial Health Engine** and **Generative AI** to provide founders and investors with precise, actionable startup survival metrics.

![VentureSense Preview](https://venture-sense-gh3t.vercel.app/og-image.png)

## 🚀 Live Environment
- **Frontend**: [https://venture-sense-gh3t.vercel.app](https://venture-sense-gh3t.vercel.app)
- **Backend API**: Hosted on Render (FastAPI)

## 🧠 Intelligence Core

### 1. Hybrid Prediction Engine
VentureSense utilizes a dual-layered scoring model:
- **ML Probability (30%)**: An XGBoost model trained on historical financial distress datasets, calibrated with isotonic regression for broad-spectrum variance.
- **Financial Health Score (70%)**: A deterministic calculator that responds in real-time to 8 critical financial levers:
    - Monthly Revenue & Expenses (Burn Rate)
    - Funding Runway & Adequacy
    - Customer Growth & Churn Rates
    - Debt-to-Asset Ratios & Cash Liquidity

### 2. SHAP Explainability
The engine doesn't just give a score; it explains it. We use **SHapley Additive exPlanations** to identify exactly which financial factors are driving the risk level higher or lower.

### 3. Oracle AI Advisory
Driven by **Google Gemini 2.0**, the Oracle translates complex mathematical risk vectors into human-readable executive action plans, providing strategic directives to improve startup longevity.

## 🎨 Premium Design System
- **Aesthetic**: High-end minimalist dark mode with a signature **Lavender & Indigo** accent palette.
- **Experience**: Custom SVG geometric background curves with horizontal drift animations for a "living" UI.
- **Typography**: Bold, high-contrast layouts using **Outfit** and **Playfair Display**.

## 🛠️ Technology Stack

### Backend (Python/FastAPI)
- **FastAPI**: High-performance asynchronous API framework.
- **XGBoost & Scikit-Learn**: Machine learning pipeline and isotonic calibration.
- **SHAP**: Model interpretability.
- **Google GenAI**: Generative advisory engine.
- **Resend**: Transactional OTP authentication.

### Frontend (Next.js/React)
- **Next.js 15 (App Router)**: Modern React framework with server-side capabilities.
- **Tailwind CSS**: Utility-first styling with custom animation extensions.
- **Lucide React**: Clean, consistent iconography.
- **Framer Motion**: Smooth component transitions and state changes.

## 📦 Local Setup

### Backend
1. Create a `.env` file in the root:
```env
GEMINI_API_KEY=your_key
RESEND_API_KEY=your_key
```
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Run the API:
```bash
python main.py
```

### Frontend
1. Navigate to `frontend/`:
```bash
cd frontend
npm install
```
2. Create a `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```
3. Start the dev server:
```bash
npm run dev
```

## 📜 License
Internal VentureSense Proprietary Documentation.

---
*Built for the future of venture intelligence.*
