"use client";

import { BookOpen, Network, BrainCircuit, ShieldAlert } from "lucide-react";

export default function MethodologyPage() {
  const sections = [
    {
      title: "XGBoost Engine",
      icon: <Network className="w-6 h-6 text-emerald-400 relative z-10" />,
      desc: "Our core prediction engine uses Extreme Gradient Boosting (XGBoost), trained on tens of thousands of real-world historical startup financial records.",
      points: [
        "Identifies non-linear patterns in financial distress.",
        "Generates a raw Failure Probability score (0% to 100%).",
        "Robust against outliers and highly accurate on tabular data."
      ],
      color: "from-emerald-500/20 to-teal-500/20",
    },
    {
      title: "SHAP Explainability",
      icon: <BrainCircuit className="w-6 h-6 text-teal-400 relative z-10" />,
      desc: "Machine Learning shouldn't be a black box. We use SHapley Additive exPlanations (SHAP) to interpret exactly why the model made its decision.",
      points: [
        "Breaks down the risk score by specific inputs.",
        "Shows exactly how much Burn Rate or Debt increases your risk.",
        "Allows you to target specific areas for immediate improvement."
      ],
      color: "from-teal-500/20 to-cyan-500/20",
    },
    {
      title: "Gemini Oracle AI",
      icon: <ShieldAlert className="w-6 h-6 text-green-400 relative z-10" />,
      desc: "Raw math isn't always actionable. We feed the SHAP output directly into Google's Gemini GenAI to generate human-readable strategic advice.",
      points: [
        "Translates mathematical impact into business strategy.",
        "Provides tailored recommendations (e.g., 'Cut SaaS spend by 10%').",
        "Acts as an automated fractional CFO."
      ],
      color: "from-green-500/20 to-emerald-600/20",
    }
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 relative z-10 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/10"></div>
          <BookOpen className="w-6 h-6 text-emerald-400 relative z-10" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">Methodology</h1>
          <p className="text-sm text-emerald-500/70 mt-1 font-medium">Understand how VentureSense calculates risk and generates insights.</p>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((s, idx) => (
          <div key={idx} className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 group hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300">
            <div className="shrink-0">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center border border-emerald-500/50 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)] relative overflow-hidden`}>
                <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors"></div>
                {s.icon}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">{s.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed mb-6">{s.desc}</p>
              
              <div className="bg-slate-950 rounded-xl p-5 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                <ul className="space-y-3">
                  {s.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                      <span className="text-sm font-medium text-slate-300 leading-relaxed">{pt}</span>
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
