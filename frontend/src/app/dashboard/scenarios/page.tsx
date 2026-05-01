"use client";

import { Box, Code, Cpu, FlaskConical, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScenariosPage() {
  const router = useRouter();

  const scenarios = [
    {
      id: "hypergrowth-saas",
      name: "Hyper-Growth SaaS",
      icon: <Code className="w-6 h-6 text-emerald-400 relative z-10" />,
      desc: "High revenue, high burn rate, and rapid customer acquisition. Typical for Series A/B software startups.",
      stats: { revenue: "$120k", burn: "$180k", runway: "18 mos" },
      color: "from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]",
      raw: {
        monthly_revenue: 120000,
        monthly_expenses: 180000,
        runway_months: 18,
        customer_growth_rate: 0.15,
        churn_rate: 0.02,
        funding_amount: 5000000,
      }
    },
    {
      id: "hardware-manufacturing",
      name: "Hardware & Manufacturing",
      icon: <Cpu className="w-6 h-6 text-teal-400 relative z-10" />,
      desc: "Capital intensive upfront, low early revenue, highly dependent on large funding rounds.",
      stats: { revenue: "$10k", burn: "$250k", runway: "12 mos" },
      color: "from-teal-500/20 to-cyan-500/20",
      border: "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]",
      raw: {
        monthly_revenue: 10000,
        monthly_expenses: 250000,
        runway_months: 12,
        customer_growth_rate: 0.01,
        churn_rate: 0.05,
        funding_amount: 3000000,
      }
    },
    {
      id: "biotech-research",
      name: "BioTech R&D",
      icon: <FlaskConical className="w-6 h-6 text-green-400 relative z-10" />,
      desc: "Zero revenue for years, massive R&D expenses, reliant entirely on runway and grants.",
      stats: { revenue: "$0", burn: "$400k", runway: "24 mos" },
      color: "from-green-500/20 to-emerald-600/20",
      border: "border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]",
      raw: {
        monthly_revenue: 0,
        monthly_expenses: 400000,
        runway_months: 24,
        customer_growth_rate: 0.0,
        churn_rate: 0.0,
        funding_amount: 10000000,
      }
    }
  ];

  const handleLoad = (scenario: any) => {
    localStorage.setItem("scenario_data", JSON.stringify(scenario.raw));
    router.push("/dashboard");
  };

  return (
    <div className="p-6 md:p-10 space-y-8 relative z-10 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/10"></div>
          <Box className="w-6 h-6 text-emerald-400 relative z-10" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">Industry Scenarios</h1>
          <p className="text-sm text-emerald-500/70 mt-1 font-medium">Load pre-configured financial states to test the AI model's accuracy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((s) => (
          <div key={s.id} onClick={() => handleLoad(s)} className={`bg-slate-900/60 backdrop-blur-xl border rounded-[2rem] p-8 flex flex-col group transition-all duration-300 cursor-pointer ${s.border}`}>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 border border-emerald-500/50 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)] relative overflow-hidden`}>
              <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors"></div>
              {s.icon}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{s.name}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">{s.desc}</p>
            
            <div className="bg-slate-950 rounded-xl p-4 border border-emerald-500/30 mb-6 shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</span>
                <span className="text-sm font-mono text-emerald-300">{s.stats.revenue}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Burn Rate</span>
                <span className="text-sm font-mono text-emerald-300">{s.stats.burn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Runway</span>
                <span className="text-sm font-mono text-emerald-300">{s.stats.runway}</span>
              </div>
            </div>

            <button 
              className="w-full bg-slate-950 text-white border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-bold py-3 rounded-xl flex items-center justify-center gap-2 group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:border-emerald-500 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300"
            >
              Load Scenario <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
