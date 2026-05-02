"use client";

import { BookOpen, Network, BrainCircuit, ShieldAlert } from "lucide-react";

export default function MethodologyPage() {
  const sections = [
    {
      title: "XGBoost Engine",
      icon: <Network className="w-6 h-6 text-[#080808] relative z-10" />,
      desc: "Our core prediction engine uses Extreme Gradient Boosting (XGBoost), trained on tens of thousands of real-world historical startup financial records.",
      points: [
        "Identifies non-linear patterns in financial distress.",
        "Generates a raw Failure Probability score (0% to 100%).",
        "Robust against outliers and highly accurate on tabular data."
      ],
      color: "from-[#A78BFA] to-indigo-600",
    },
    {
      title: "SHAP Explainability",
      icon: <BrainCircuit className="w-6 h-6 text-[#080808] relative z-10" />,
      desc: "Machine Learning shouldn't be a black box. We use SHapley Additive exPlanations (SHAP) to interpret exactly why the model made its decision.",
      points: [
        "Breaks down the risk score by specific inputs.",
        "Shows exactly how much Burn Rate or Debt increases your risk.",
        "Allows you to target specific areas for immediate improvement."
      ],
      color: "from-[#C4B5FD] to-[#A78BFA]",
    },
    {
      title: "Gemini Oracle AI",
      icon: <ShieldAlert className="w-6 h-6 text-[#080808] relative z-10" />,
      desc: "Raw math isn't always actionable. We feed the SHAP output directly into Google's Gemini GenAI to generate human-readable strategic advice.",
      points: [
        "Translates mathematical impact into business strategy.",
        "Provides tailored recommendations (e.g., 'Cut SaaS spend by 10%').",
        "Acts as an automated fractional CFO."
      ],
      color: "from-[#A78BFA] to-[#6D28D9]",
    }
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 relative z-10 animate-fade-in-up">
      <div className="flex items-center gap-6 mb-12">
        <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#A78BFA]/20 shadow-[0_0_20px_rgba(167,139,250,0.2)]">
          <BookOpen className="w-6 h-6 text-[#A78BFA]" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center">
            <span className="text-[#A78BFA] mr-2">{"}"}</span> Methodology
          </h1>
          <p className="text-[10px] text-slate-500 mt-2 font-black tracking-[0.3em] uppercase">Understand the infrastructure behind VentureSense risk intelligence.</p>
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((s, idx) => (
          <div key={idx} className="luxury-card p-10 flex flex-col md:flex-row gap-10 group">
            <div className="shrink-0">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(167,139,250,0.3)] relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {s.icon}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-black tracking-tight text-white mb-4">{s.title}</h3>
              <p className="text-slate-500 text-lg leading-relaxed mb-8 font-medium">{s.desc}</p>
              
              <div className="bg-[#080808] rounded-2xl p-8 border border-white/5 group-hover:border-[#A78BFA]/20 transition-all shadow-inner">
                <ul className="space-y-4">
                  {s.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] mt-2.5 shrink-0 shadow-[0_0_10px_#A78BFA]"></div>
                      <span className="text-sm font-black text-slate-400 uppercase tracking-widest leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
