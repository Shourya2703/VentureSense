"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Loader2, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function OracleAdvisoryPage() {
  const router = useRouter();
  const [prediction, setPrediction] = useState<any>(null);
  const [advisory, setAdvisory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvisory = async (pred: any) => {
      try {
        const token = localStorage.getItem("vs_token");
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${API_URL}/advisory`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            probability: pred.failure_probability,
            risk_level: pred.risk_level,
            features: pred.top_contributing_features
          }),
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/");
            return;
          }
          throw new Error("Failed to communicate with Oracle AI.");
        }
        
        const data = await response.json();
        setAdvisory(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    const storedData = localStorage.getItem("vs_prediction");
    if (!storedData) {
      router.push("/dashboard");
      return;
    }

    try {
      const parsed = JSON.parse(storedData);
      setPrediction(parsed);
      fetchAdvisory(parsed);
    } catch (e) {
      router.push("/dashboard");
    }
  }, [router]);

  if (loading || !prediction) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center relative z-10 gap-8 animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-[#A78BFA] blur-[50px] opacity-20 rounded-full animate-pulse"></div>
          <div className="w-24 h-24 border-[4px] border-white/5 border-t-[#A78BFA] rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black tracking-tighter mb-2 brand-gradient-text">Oracle is Analyzing</h2>
          <p className="text-slate-500 font-medium tracking-[0.3em] uppercase text-[10px]">Synthesizing massive datasets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-10 relative z-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-[#A78BFA] rounded-[1.5rem] shadow-[0_0_30px_rgba(167,139,250,0.3)]">
            <Sparkles className="w-8 h-8 text-[#080808]" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center">
              <span className="text-[#A78BFA] mr-2">{"}"}</span> Oracle Advisory
            </h1>
            <p className="text-[10px] text-slate-500 mt-2 font-black tracking-[0.3em] uppercase">AI-Generated Tactical Directives</p>
          </div>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-slate-400 font-bold hover:bg-white/5 hover:text-white transition-all self-start md:self-auto uppercase tracking-widest text-[10px]">
          <ArrowLeft className="w-4 h-4" /> Return to Simulator
        </Link>
      </div>

      {error ? (
        <div className="luxury-card p-16 flex flex-col items-center justify-center text-center gap-6">
          <AlertTriangle className="w-16 h-16 text-rose-500" />
          <h3 className="text-2xl font-black text-white uppercase tracking-widest">Connection Failed</h3>
          <p className="text-slate-500 max-w-md font-medium leading-relaxed">{error}</p>
          <button onClick={() => window.location.reload()} className="brand-button">Retry Connection</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
            <div className="luxury-card p-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-8">Current Posture</h3>
              <div className="flex items-end gap-4 mb-10 pb-10 border-b border-white/5">
                <span className="text-8xl font-black tracking-tighter leading-none">{Math.round(prediction.failure_probability * 100)}<span className="text-3xl text-slate-700">%</span></span>
                <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                  prediction.risk_level === 'High' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                  prediction.risk_level === 'Medium' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                  'bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20'
                }`}>
                  {prediction.risk_level} Risk
                </div>
              </div>
              
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A78BFA] mb-6 flex items-center gap-3">
                <Lightbulb className="w-5 h-5" /> Strategic Assessment
              </h3>
              <p className="text-slate-400 leading-relaxed text-xl font-medium italic relative before:content-[''] before:absolute before:-left-6 before:top-0 before:bottom-0 before:w-1.5 before:bg-[#A78BFA]/20 pl-6">
                "{advisory.explanation}"
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="luxury-card p-12 h-full">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A78BFA] mb-10 flex items-center gap-3">
                <TrendingUp className="w-5 h-5" /> Executive Action Plan
              </h3>
              
              <div className="space-y-6">
                {advisory.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-8 group bg-[#080808] p-8 rounded-[2rem] border border-white/5 hover:border-[#A78BFA]/30 hover:shadow-[0_0_40px_rgba(167,139,250,0.1)] transition-all duration-500">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-[#111] border border-[#A78BFA]/20 flex items-center justify-center text-[#A78BFA] font-black text-2xl group-hover:scale-110 group-hover:bg-[#A78BFA] group-hover:text-[#080808] transition-all">
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center">
                      <p className="text-slate-400 text-lg leading-relaxed font-medium group-hover:text-white transition-colors">
                        {rec}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
