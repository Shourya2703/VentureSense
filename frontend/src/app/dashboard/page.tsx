"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { Activity, TrendingUp, AlertTriangle, Lightbulb, ShieldAlert, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Loader2, BarChart2, Zap, Target, Calendar, Cpu, Info, Settings, BookOpen } from "lucide-react";

export default function SimulatorPage() {
  const [formData, setFormData] = useState({
    monthly_revenue: 4000000,
    monthly_expenses: 6400000,
    burn_rate: 2400000,
    runway_months: 12,
    customer_growth_rate: 0.05,
    churn_rate: 0.02,
    funding_amount: 80000000,
    debt_ratio_percent: 45.0,
    cash_to_total_assets: 0.25,
    net_income_to_total_assets: -0.05,
  });

  const router = useRouter();
  const [prediction, setPrediction] = useState<any>(null);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      burn_rate: Math.max(0, prev.monthly_expenses - prev.monthly_revenue)
    }));
  }, [formData.monthly_revenue, formData.monthly_expenses]);

  useEffect(() => {
    const loaded = localStorage.getItem("scenario_data");
    if (loaded) {
      try {
        const parsed = JSON.parse(loaded);
        setFormData(prev => ({ ...prev, ...parsed }));
        localStorage.removeItem("scenario_data");
      } catch(e) {}
    }

    fetch("http://127.0.0.1:8000/metrics")
      .then(res => res.json())
      .then(data => setModelMetrics(data))
      .catch(err => console.error("Failed to fetch metrics:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, [name]: val }));
    setActivePreset(null);
  };

  const fetchPrediction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("vs_token");
      if (!token) throw new Error("No authentication token found. Please sign in again.");

      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          localStorage.removeItem("vs_token");
          router.push("/");
          return;
        }
        throw new Error(errorData.detail || `API Error (${response.status}): Failed to calculate risk.`);
      }

      const data = await response.json();
      setPrediction(data);
      setHistory(prev => [...prev.slice(-14), { time: new Date().toLocaleTimeString(), prob: data.failure_probability }]);
    } catch (err: any) {
      console.error("Prediction Error:", err);
      setError(err.message || "Failed to connect to the prediction engine.");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPrediction();
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [formData, fetchPrediction]);

  const getRiskColor = (level: string) => {
    if (level === "Low") return "text-[#A78BFA] border-[#A78BFA]/30 bg-[#A78BFA]/10";
    if (level === "Medium") return "text-indigo-400 border-indigo-400/30 bg-indigo-400/10";
    return "text-rose-500 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A78BFA] opacity-[0.05] blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              <span className="text-[#A78BFA]">{"}"}</span> VentureSense Oracle
            </h1>
            <p className="text-slate-500 font-medium tracking-[0.2em] uppercase text-[10px]">Elite Financial Intelligence & Risk Mitigation</p>
          </div>
          <div className="flex items-center gap-4 bg-[#0A0A0A] p-2 rounded-2xl border border-white/5 shadow-2xl">
            <div className="px-4 py-2 rounded-xl bg-[#A78BFA]/5 border border-[#A78BFA]/10">
              <span className="text-[10px] block uppercase font-black text-[#A78BFA] tracking-widest mb-1">Engine Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-indigo-400 animate-pulse' : 'bg-[#A78BFA]'}`}></div>
                <span className="text-xs font-mono font-bold">V2.8 PURPLE</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[#0A0A0A] border-2 border-white/10 rounded-[3rem] p-10 group hover:border-[#A78BFA]/50 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Node Control</h3>
                <Settings className="w-4 h-4 text-slate-700" />
              </div>
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2.5 bg-[#111] border border-[#A78BFA]/20 rounded-2xl">
                  <TrendingUp className="w-5 h-5 text-[#A78BFA]" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Scenario Architect</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-10">
                {[
                  { id: "healthy", label: "Healthy", color: "border-[#A78BFA] bg-[#A78BFA]/10", data: { monthly_revenue: 5000000, monthly_expenses: 3500000, runway_months: 18, customer_growth_rate: 0.12, churn_rate: 0.02, funding_amount: 50000000 } },
                  { id: "growing", label: "Growing", color: "border-indigo-500 bg-indigo-500/10", data: { monthly_revenue: 2500000, monthly_expenses: 4500000, runway_months: 12, customer_growth_rate: 0.25, churn_rate: 0.05, funding_amount: 100000000 } },
                  { id: "failing", label: "Failing", color: "border-rose-500 bg-rose-500/10", data: { monthly_revenue: 500000, monthly_expenses: 4000000, runway_months: 2, customer_growth_rate: -0.05, churn_rate: 0.25, funding_amount: 10000000 } },
                ].map((p) => (
                  <button 
                    key={p.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, ...p.data }));
                      setActivePreset(p.id);
                    }}
                    className={`text-[9px] font-black uppercase tracking-widest py-3 rounded-xl border transition-all duration-300 ${
                      activePreset === p.id 
                        ? p.color + " text-white" 
                        : "border-white/5 text-slate-500 hover:border-white/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="space-y-8">
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4">Revenue & Costs</div>
                <SliderInput label="Monthly Revenue" name="monthly_revenue" value={formData.monthly_revenue} min={0} max={10000000} step={100000} onChange={handleChange} icon={<Zap className="w-4 h-4" />} format="₹" />
                <SliderInput label="Monthly Expenses" name="monthly_expenses" value={formData.monthly_expenses} min={100000} max={20000000} step={100000} onChange={handleChange} icon={<Activity className="w-4 h-4" />} format="₹" />
                
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mt-8 mb-4">Growth & Retention</div>
                <SliderInput label="Growth Rate" name="customer_growth_rate" value={formData.customer_growth_rate} min={-0.2} max={0.3} step={0.01} onChange={handleChange} icon={<Cpu className="w-4 h-4" />} format="%" />
                <SliderInput label="Churn Rate" name="churn_rate" value={formData.churn_rate} min={0} max={0.5} step={0.01} onChange={handleChange} icon={<AlertTriangle className="w-4 h-4" />} format="%" />
                
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mt-8 mb-4">Capital & Leverage</div>
                <SliderInput label="Total Funding" name="funding_amount" value={formData.funding_amount} min={0} max={200000000} step={1000000} onChange={handleChange} icon={<TrendingUp className="w-4 h-4" />} format="₹" />
                <SliderInput label="Debt Ratio" name="debt_ratio_percent" value={formData.debt_ratio_percent} min={0} max={100} step={1} onChange={handleChange} icon={<Target className="w-4 h-4" />} format="%" />
                <SliderInput label="Cash Ratio" name="cash_to_total_assets" value={formData.cash_to_total_assets} min={0.01} max={0.8} step={0.01} onChange={handleChange} icon={<Calendar className="w-4 h-4" />} format="%" />
              </div>

              {error && <p className="mt-10 text-rose-500 text-center text-xs font-bold bg-rose-500/5 py-4 rounded-2xl border border-rose-500/10 uppercase tracking-widest">{error}</p>}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
              <div className="luxury-card p-12 flex flex-col items-center justify-center relative min-h-[480px]">
                <div className="absolute top-8 left-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#A78BFA]/30">Risk Probability</div>
                
                <div className="relative w-64 h-64 mb-10">
                  <div className="absolute inset-0 rounded-full border-[10px] border-white/5 shadow-inner"></div>
                  <svg className="w-full h-full -rotate-90 transform">
                    <circle
                      cx="128"
                      cy="128"
                      r="110"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray="691"
                      strokeDashoffset={691 * (1 - (prediction?.failure_probability ?? 0))}
                      className={`transition-all duration-1000 ease-in-out ${
                        prediction?.risk_level === 'High' ? 'text-rose-500' :
                        prediction?.risk_level === 'Medium' ? 'text-indigo-500' :
                        'text-[#A78BFA]'
                      }`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-black tracking-tighter">
                      {prediction ? Math.round(prediction.failure_probability * 100) : '--'}
                      <span className="text-2xl font-light opacity-20">%</span>
                    </span>
                    {prediction && (
                      <div className={`mt-6 px-5 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] ${getRiskColor(prediction.risk_level)}`}>
                        {prediction.risk_level} Risk
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full mt-auto space-y-4">
                  <div className="flex justify-between text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mb-2">
                    <span>Confidence Index</span>
                    <span className="text-[#A78BFA] font-mono">{((prediction?.confidence_score ?? 0.7) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-[#A78BFA] transition-all duration-1000 shadow-[0_0_20px_rgba(167,139,250,0.5)]"
                      style={{ width: `${prediction ? prediction.failure_probability * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="luxury-card p-1 relative overflow-hidden">
                <div className="bg-[#0A0A0A] rounded-[2.3rem] p-10 h-full flex flex-col justify-center items-center text-center">
                  {!prediction ? (
                    <div className="flex flex-col items-center justify-center opacity-30">
                      <Sparkles className="w-16 h-16 text-[#A78BFA] mb-6" />
                      <h3 className="text-xl font-bold mb-2">Oracle Offline</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Awaiting assessment data</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-10 w-full">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#A78BFA] blur-[40px] opacity-20 rounded-full animate-pulse"></div>
                        <div className="p-6 bg-[#111] border border-[#A78BFA]/20 rounded-[2rem] relative">
                          <Sparkles className="w-10 h-10 text-[#A78BFA]" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black mb-4 tracking-tight">Oracle Intelligence</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">VentureSense GenAI is primed to synthesize strategic directives from your data.</p>
                      </div>
                      <button 
                        onClick={() => {
                          localStorage.setItem("vs_prediction", JSON.stringify(prediction));
                          router.push("/dashboard/advisory");
                        }} 
                        className="brand-button w-full"
                      >
                        Summon Oracle <ArrowRight className="inline-block ml-3 w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="luxury-card p-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-2 bg-white/5 rounded-xl text-[#A78BFA]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-[10px] tracking-[0.3em] uppercase text-slate-500">Variance Trace</h3>
                </div>
                <div className="h-[220px] w-full mt-auto">
                  {history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }} itemStyle={{ color: '#A78BFA' }} />
                        <Line type="monotone" dataKey="prob" stroke="#A78BFA" strokeWidth={5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-800 gap-4">
                      <Activity className="w-12 h-12" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Listening for signals</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="luxury-card p-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-2 bg-white/5 rounded-xl text-[#A78BFA]">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-[10px] tracking-[0.3em] uppercase text-slate-500">Top Risk Drivers</h3>
                </div>
                <div className="space-y-8 flex-1 flex flex-col justify-center">
                  {!prediction || !prediction.top_contributing_features ? (
                    <div className="flex flex-col items-center justify-center text-slate-800 gap-4 h-full">
                      <BarChart2 className="w-12 h-12" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Synthesizing drivers</span>
                    </div>
                  ) : (
                    prediction.top_contributing_features.map((feat: any, idx: number) => (
                      <div key={idx} className="flex flex-col gap-3">
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <span>{feat.feature.replace(/_/g, ' ')}</span>
                          <span className={feat.impact === 'positive' ? 'text-rose-500' : 'text-[#A78BFA]'}>
                            {feat.impact === 'positive' ? '↑ Increasing' : '↓ Stabilizing'}
                          </span>
                        </div>
                        <div className="w-full bg-[#111] rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${feat.impact === 'positive' ? 'bg-rose-500' : 'bg-[#A78BFA]'}`}
                            style={{ width: `${Math.min(100, Math.abs(feat.contribution) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SliderInput = ({ label, name, value, min, max, step, onChange, icon, format }: any) => (
  <div className="group space-y-5">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4 text-slate-500 group-focus-within:text-[#A78BFA] transition-colors">
        <span className="p-2 bg-[#111] border border-white/5 rounded-xl group-hover:border-[#A78BFA]/30 transition-all">
          {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      <span className="text-[11px] font-mono font-black text-white bg-[#0A0A0A] px-4 py-2 rounded-xl border border-white/5 group-hover:border-[#A78BFA]/20 transition-all">
        {format === '₹' ? `₹${(value / 100000).toFixed(1)}L` : format === '%' ? `${(value * 100).toFixed(0)}%` : value}
      </span>
    </div>
    <div className="relative flex items-center h-10 px-1">
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-1 bg-[#111] rounded-full appearance-none cursor-pointer accent-[#A78BFA] hover:accent-[#C4B5FD] transition-all"
      />
    </div>
  </div>
);
