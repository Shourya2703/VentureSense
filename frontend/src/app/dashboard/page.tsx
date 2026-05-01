"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { Activity, TrendingUp, AlertTriangle, Lightbulb, ShieldAlert, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Loader2, BarChart2 } from "lucide-react";

export default function SimulatorPage() {
  const [formData, setFormData] = useState({
    monthly_revenue: 50000,
    monthly_expenses: 80000,
    burn_rate: 30000,
    runway_months: 12,
    customer_growth_rate: 0.05,
    churn_rate: 0.02,
    funding_amount: 1000000,
    debt_ratio_percent: 45.0,
    cash_to_total_assets: 0.25,
    net_income_to_total_assets: -0.05,
  });

  const [prediction, setPrediction] = useState<any>(null);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [advisory, setAdvisory] = useState<any>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);

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

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      burn_rate: Math.max(0, prev.monthly_expenses - prev.monthly_revenue)
    }));
  }, [formData.monthly_revenue, formData.monthly_expenses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = parseFloat(value) || 0;
    const finalVal = ['monthly_revenue', 'monthly_expenses', 'runway_months', 'funding_amount'].includes(name) 
      ? Math.max(0, val) : val;

    setFormData((prev) => ({ ...prev, [name]: finalVal }));
  };

  const fetchPrediction = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAdvisory(null); 
    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("API Request failed");
      const data = await response.json();
      setPrediction(data);
      setHistory(prev => [...prev.slice(-14), { time: new Date().toLocaleTimeString(), prob: data.failure_probability }]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const fetchAdvisory = async () => {
    if (!prediction) return;
    setAdvisoryLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          probability: prediction.failure_probability,
          risk_level: prediction.risk_level,
          features: prediction.top_contributing_features
        }),
      });
      if (!response.ok) throw new Error("API Request failed");
      const data = await response.json();
      setAdvisory(data);
    } catch (err: any) {
      console.error(err);
      setAdvisory({
        explanation: `AI Generation failed: ${err.message}. Please check your GEMINI_API_KEY.`,
        recommendations: ["Configure a valid GEMINI_API_KEY to see real AI suggestions."]
      });
    } finally {
      setAdvisoryLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPrediction();
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [formData, fetchPrediction]);

  const getRiskColor = (level: string) => {
    if (level === "Low") return "text-emerald-400 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    if (level === "Medium") return "text-amber-400 border-amber-500/50 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.3)]";
    return "text-rose-500 border-rose-500/50 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
  };

  const getRiskIcon = (level: string) => {
    if (level === "Low") return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (level === "Medium") return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    return <ShieldAlert className="w-5 h-5 text-rose-500" />;
  };

  return (
    <div className="p-6 md:p-10 space-y-8 relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">Interactive Simulator</h1>
          <p className="text-sm text-emerald-500/70 mt-1 font-medium">Fine-tune variables to stress-test your startup's financial health.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-emerald-500/50 flex items-center gap-2 text-xs font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-emerald-300 animate-pulse shadow-[0_0_10px_rgba(110,231,183,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`}></div>
            {loading ? "Syncing..." : "Live"}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/50 rounded-2xl text-rose-400 flex items-center gap-3 font-medium text-sm shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-fade-in-up">
          <AlertCircle className="w-5 h-5" />
          {error}. Ensure the backend is running.
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: What-If Simulator (Glowy Green Border Form) */}
        <div className="xl:col-span-4">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 h-full flex flex-col group border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-400 transition-all relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/10"></div>
                <TrendingUp className="w-5 h-5 relative z-10" />
              </div>
              <h2 className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">Input Parameters</h2>
            </div>
            
            <div className="space-y-8 flex-1 relative z-10">
              {[
                { label: "Monthly Revenue", name: "monthly_revenue", step: "1000", min: "0", max: "500000", prefix: "$" },
                { label: "Monthly Expenses", name: "monthly_expenses", step: "1000", min: "0", max: "500000", prefix: "$" },
                { label: "Runway (Months)", name: "runway_months", step: "1", min: "0", max: "60", prefix: "" },
                { label: "Growth Rate (Dec)", name: "customer_growth_rate", step: "0.01", min: "-0.5", max: "2", prefix: "" },
                { label: "Churn Rate (Dec)", name: "churn_rate", step: "0.01", min: "0", max: "0.5", prefix: "" },
                { label: "Funding Amount", name: "funding_amount", step: "10000", min: "0", max: "10000000", prefix: "$" },
              ].map((field) => (
                <div key={field.name} className="space-y-3 group/slider">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-400 group-hover/slider:text-emerald-400 transition-colors tracking-wide">{field.label}</label>
                    <span className="text-xs font-mono font-bold bg-slate-950 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] px-2 py-1 rounded-md text-emerald-300">
                      {field.prefix}{(formData as any)[field.name]}
                    </span>
                  </div>
                  <input
                    type="range"
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    step={field.step}
                    min={field.min}
                    max={field.max}
                    className="w-full h-1.5 bg-slate-800 border border-emerald-500/20 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics */}
        <div className="xl:col-span-8 space-y-6 flex flex-col">
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Risk Assessment Gauge */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-[2rem] p-8 flex flex-col justify-center relative overflow-hidden group hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-slate-800/50 border border-emerald-500/30 text-emerald-400 group-hover:text-emerald-300 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">Failure Risk</h3>
              </div>
              
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                    {prediction ? (prediction.failure_probability * 100).toFixed(1) : "--"}
                  </span>
                  <span className="text-3xl text-slate-500 font-bold mb-1">%</span>
                </div>
                
                {prediction && (
                  <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${getRiskColor(prediction.risk_level)}`}>
                    {getRiskIcon(prediction.risk_level)}
                    <span className="font-bold tracking-wide text-xs">{prediction.risk_level} Risk</span>
                  </div>
                )}
              </div>
              
              <div className="mt-auto pt-6">
                <div className="w-full bg-slate-800/80 border border-emerald-500/30 rounded-full h-2 mb-2 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out shadow-[0_0_15px_currentColor] rounded-full ${
                      prediction?.risk_level === 'High' ? 'bg-rose-500 text-rose-500' :
                      prediction?.risk_level === 'Medium' ? 'bg-amber-400 text-amber-400' :
                      'bg-emerald-500 text-emerald-500'
                    }`}
                    style={{ width: `${prediction ? prediction.failure_probability * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span>Safe</span>
                  <span>Critical</span>
                </div>
              </div>
            </div>

            {/* Model Metrics & History */}
            <div className="flex flex-col gap-6">
              {/* Prediction History */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-[2rem] p-6 flex-1 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-slate-800/50 border border-emerald-500/30 text-emerald-400 group-hover:text-emerald-300 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">Live Trend</h3>
                </div>
                <div className="h-28 w-full">
                  {history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} domain={[0, 1]} tickFormatter={(val) => `${(val*100).toFixed(0)}%`} />
                        <RechartsTooltip 
                          contentStyle={{backgroundColor: '#020617', borderColor: 'rgba(16,185,129,0.5)', color: '#f8fafc', borderRadius: '1rem', boxShadow: '0 0 20px rgba(16,185,129,0.3)'}}
                          labelStyle={{display: 'none'}}
                          formatter={(value: any) => [`${(Number(value)*100).toFixed(1)}%`, 'Risk']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="prob" 
                          stroke="#10B981" 
                          strokeWidth={3} 
                          dot={false} 
                          activeDot={{r: 5, fill: '#020617', stroke: '#10B981', strokeWidth: 2}} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">Simulate to plot trace</div>
                  )}
                </div>
              </div>

              {/* Model Metrics */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-[1.5rem] p-4 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 rounded-xl p-3 border border-emerald-500/30 flex flex-col items-center justify-center hover:border-emerald-400 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <div className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">ROC-AUC</div>
                    <div className="text-emerald-400 font-bold text-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">{modelMetrics ? modelMetrics.roc_auc.toFixed(3) : '--'}</div>
                  </div>
                  <div className="bg-slate-800/30 rounded-xl p-3 border border-emerald-500/30 flex flex-col items-center justify-center hover:border-teal-400 transition-colors shadow-[0_0_10px_rgba(20,184,166,0.1)]">
                    <div className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Accuracy</div>
                    <div className="text-teal-400 font-bold text-lg drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">{modelMetrics ? (modelMetrics.accuracy * 100).toFixed(1) + '%' : '--'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MASSIVE AI BANNER CTA (Glowy Green) */}
          {prediction && !advisory && !advisoryLoading && (
            <div 
              onClick={fetchAdvisory}
              className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 p-[1px] cursor-pointer shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all duration-500"
            >
              <div className="absolute inset-0 bg-white/20 blur-xl group-hover:bg-white/30 transition-colors"></div>
              <div className="relative bg-slate-950/80 backdrop-blur-xl rounded-[31px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 h-full border border-emerald-500/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:scale-110 group-hover:rotate-12 transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/20"></div>
                    <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-0.5 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">Generate AI Strategy</h3>
                    <p className="text-emerald-100/70 text-sm font-medium">Turn SHAP metrics into a tailored action plan.</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform">
                  Run Oracle <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          )}

          {advisoryLoading && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/50 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-emerald-400 font-bold text-sm">Consulting Gemini Oracle...</p>
            </div>
          )}

          {/* AI Advisory Content */}
          {advisory && (
            <div className="bg-slate-950/80 backdrop-blur-xl rounded-[2rem] p-8 relative overflow-hidden group border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-fade-in-up">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/30 transition-all"></div>
              
              <div className="relative z-10 flex flex-col xl:flex-row gap-8 items-start">
                <div className="xl:w-1/3 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-emerald-500/50 text-[10px] font-bold text-emerald-400 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full"></div>
                    <Sparkles className="w-3 h-3 relative z-10" /> <span className="relative z-10">Oracle Engine</span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight leading-none drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Strategic Plan</h2>
                  <p className="text-emerald-100/60 text-sm leading-relaxed font-medium">
                    AI-generated roadmap based on your localized SHAP impact values.
                  </p>
                </div>

                <div className="xl:w-2/3 w-full bg-slate-900/50 rounded-2xl border border-emerald-500/40 p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
                  <div className="space-y-6 relative z-10">
                    <div className="border-l-[4px] border-emerald-500 pl-4 bg-gradient-to-r from-emerald-500/10 to-transparent py-2 rounded-r-xl">
                      <p className="text-white text-base font-bold leading-relaxed">
                        {advisory.explanation}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {advisory.recommendations?.map((rec: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                          <div className="p-1.5 bg-slate-950 rounded-lg shrink-0 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <Lightbulb className="w-4 h-4 text-emerald-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-200 leading-relaxed">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Row: SHAP Chart */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-[2rem] p-8 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-white/5 border border-emerald-500/30 text-emerald-400 group-hover:text-emerald-300 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white text-lg font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">Key Risk Drivers</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">SHAP Feature Importance</p>
              </div>
            </div>
            
            <div className="h-56 w-full">
              {prediction?.top_contributing_features ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prediction.top_contributing_features} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} width={140} />
                    <RechartsTooltip 
                      cursor={{fill: 'rgba(255,255,255,0.02)'}}
                      contentStyle={{backgroundColor: '#020617', borderColor: 'rgba(16,185,129,0.5)', color: '#f8fafc', borderRadius: '1rem', fontWeight: 'bold', boxShadow: '0 0 20px rgba(16,185,129,0.3)'}}
                    />
                    <Bar dataKey="contribution" radius={[0, 6, 6, 0]} barSize={24}>
                      {prediction.top_contributing_features.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.impact === 'positive' ? '#ef4444' : '#10B981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">No data available</div>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div> Increases Risk</span>
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> Decreases Risk</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
