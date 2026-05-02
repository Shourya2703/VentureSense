"use client";

import { Box, Code, Cpu, FlaskConical, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ScenariosPage() {
  const router = useRouter();

  const scenarios = [
    {
      id: "hypergrowth-saas",
      name: "Hyper-Growth SaaS",
      icon: <Code className="w-6 h-6 text-[#A78BFA] relative z-10" />,
      desc: "High revenue, high burn rate, and rapid customer acquisition. Typical for Series A/B software startups.",
      stats: { revenue: "₹96L", burn: "₹1.4Cr", runway: "18 mos" },
      color: "from-[#A78BFA]/20 to-indigo-600/20",
      border: "border-white/5 shadow-2xl hover:border-[#A78BFA]/40 hover:shadow-[0_0_40px_rgba(167,139,250,0.1)]",
      raw: {
        monthly_revenue: 9600000,
        monthly_expenses: 14400000,
        runway_months: 18,
        customer_growth_rate: 0.15,
        churn_rate: 0.02,
        funding_amount: 400000000,
      }
    },
    {
      id: "hardware-manufacturing",
      name: "Hardware & Manufacturing",
      icon: <Cpu className="w-6 h-6 text-[#A78BFA] relative z-10" />,
      desc: "Capital intensive upfront, low early revenue, highly dependent on large funding rounds.",
      stats: { revenue: "₹8L", burn: "₹2Cr", runway: "12 mos" },
      color: "from-[#A78BFA]/20 to-indigo-600/20",
      border: "border-white/5 shadow-2xl hover:border-[#A78BFA]/40 hover:shadow-[0_0_40px_rgba(167,139,250,0.1)]",
      raw: {
        monthly_revenue: 800000,
        monthly_expenses: 20000000,
        runway_months: 12,
        customer_growth_rate: 0.01,
        churn_rate: 0.05,
        funding_amount: 240000000,
      }
    },
    {
      id: "biotech-research",
      name: "BioTech R&D",
      icon: <FlaskConical className="w-6 h-6 text-[#A78BFA] relative z-10" />,
      desc: "Zero revenue for years, massive R&D expenses, reliant entirely on runway and grants.",
      stats: { revenue: "₹0", burn: "₹3.2Cr", runway: "24 mos" },
      color: "from-[#A78BFA]/20 to-indigo-600/20",
      border: "border-white/5 shadow-2xl hover:border-[#A78BFA]/40 hover:shadow-[0_0_40px_rgba(167,139,250,0.1)]",
      raw: {
        monthly_revenue: 0,
        monthly_expenses: 32000000,
        runway_months: 24,
        customer_growth_rate: 0.0,
        churn_rate: 0.0,
        funding_amount: 800000000,
      }
    }
  ];

  const handleLoad = (scenario: any) => {
    localStorage.setItem("scenario_data", JSON.stringify(scenario.raw));
    router.push("/dashboard");
  };

  return (
    <div className="p-6 md:p-10 space-y-8 relative z-10 animate-fade-in-up">
      <div className="flex items-center gap-6 mb-12">
        <div className="p-4 bg-[#0A0A0A] rounded-2xl border border-[#A78BFA]/20 shadow-[0_0_20px_rgba(167,139,250,0.2)]">
          <Box className="w-6 h-6 text-[#A78BFA]" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center">
            <span className="text-[#A78BFA] mr-2">{"}"}</span> Industry Scenarios
          </h1>
          <p className="text-[10px] text-slate-500 mt-2 font-black tracking-[0.3em] uppercase">Test the AI model's precision against pre-configured signals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scenarios.map((s) => (
          <div key={s.id} onClick={() => handleLoad(s)} className={`bg-[#0A0A0A] backdrop-blur-xl border rounded-[2.5rem] p-10 flex flex-col group transition-all duration-500 cursor-pointer ${s.border}`}>
            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${s.color} flex items-center justify-center mb-8 border border-[#A78BFA]/20 group-hover:scale-110 transition-transform relative overflow-hidden`}>
              {s.icon}
            </div>
            
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{s.name}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-1 font-medium">{s.desc}</p>
            
            <div className="bg-[#080808] rounded-2xl p-6 border border-white/5 mb-8 shadow-inner group-hover:border-[#A78BFA]/20 transition-all">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Revenue</span>
                <span className="text-sm font-mono text-white">{s.stats.revenue}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Burn Rate</span>
                <span className="text-sm font-mono text-white">{s.stats.burn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Runway</span>
                <span className="text-sm font-mono text-white">{s.stats.runway}</span>
              </div>
            </div>

            <button 
              className="w-full bg-[#111] text-white border border-white/10 font-black text-[10px] uppercase tracking-[0.3em] py-4 rounded-xl flex items-center justify-center gap-3 group-hover:bg-[#A78BFA] group-hover:text-[#080808] group-hover:border-[#A78BFA] group-hover:shadow-[0_0_30px_rgba(167,139,250,0.3)] transition-all duration-300"
            >
              Load Scenario <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
