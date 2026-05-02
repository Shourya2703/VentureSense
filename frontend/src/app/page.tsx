"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "./components/AuthModal";
import { Sparkles, TrendingUp, ShieldCheck, Cpu, ArrowRight, Zap, Activity, PieChart, Globe } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setIsSignedIn(!!localStorage.getItem("vs_token"));
  }, []);

  const handleLogoClick = () => {
    setAnimKey(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStart = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#A78BFA] selection:text-[#080808]">
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(167,139,250,0.15)_0%,rgba(139,92,246,0.05)_40%,transparent_70%)] opacity-80 blur-[120px]"></div>
        

        <svg className="absolute inset-0 w-[200%] h-full opacity-20 animate-drift-left" viewBox="0 0 200 100" preserveAspectRatio="none">
          <path d="M-20,50 Q25,10 50,50 T110,40 T170,50 T220,45" fill="none" stroke="white" strokeWidth="0.05" />
          <path d="M-20,80 Q30,30 80,60 T140,40 T200,70" fill="none" stroke="#A78BFA" strokeWidth="0.08" />
          <path d="M-20,30 Q40,70 100,30 T180,60 T220,30" fill="none" stroke="white" strokeWidth="0.03" />
        </svg>
        <svg className="absolute inset-0 w-[200%] h-full opacity-10 animate-drift-right" viewBox="0 0 200 100" preserveAspectRatio="none">
          <path d="M-20,60 Q50,20 100,60 T160,35 T220,55" fill="none" stroke="#A78BFA" strokeWidth="0.06" />
          <path d="M-20,40 Q60,80 120,40 T200,70" fill="none" stroke="white" strokeWidth="0.04" />
        </svg>
      </div>


      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/90 backdrop-blur-2xl border-b-2 border-[#A78BFA]/40 shadow-[0_4px_30px_rgba(167,139,250,0.1)]">
        <div className="max-w-7xl mx-auto px-10 py-6 flex justify-between items-center">
          <button onClick={handleLogoClick} className="flex items-center gap-4 group transition-transform active:scale-95">
            <div className="relative">
              <div className="absolute inset-0 bg-[#A78BFA]/20 blur-xl rounded-full"></div>
              <svg className="w-10 h-10 relative z-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">

                <path d="M10 12L20 28L30 12" stroke="#A78BFA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 28V32" stroke="#A78BFA" strokeWidth="4" strokeLinecap="round" />
                <circle cx="20" cy="28" r="3" fill="white" className="animate-pulse" />
                <path d="M15 12L20 20L25 12" stroke="white" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white flex items-center">
              VentureSense
            </span>
          </button>
          <div className="hidden md:flex items-center gap-12">
            {[
              { name: 'Predictor', href: '/dashboard' },
              { name: 'Scenarios', href: '/dashboard/scenarios' }
            ].map((link) => (
              <Link key={link.name} href={link.href} className="text-[10px] font-black text-slate-400 hover:text-[#A78BFA] transition-all tracking-[0.3em] uppercase">
                {link.name}
              </Link>
            ))}
              {isSignedIn ? (
                <Link href="/dashboard" className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white font-bold py-2.5 px-8 rounded-full transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.2em] text-[10px]">
                  Dashboard
                </Link>
              ) : (
                <button onClick={() => setAuthOpen(true)} className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white font-bold py-2.5 px-8 rounded-full transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.2em] text-[10px]">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>
  
        <main key={animKey} className="relative z-10 pt-40 pb-32">

          <section className="max-w-7xl mx-auto px-10 border-b border-white/5 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-40 items-center">
              <div className="animate-fade-in-up">
                <h1 className="text-[5rem] md:text-[7rem] font-bold leading-[0.9] tracking-tighter mb-10 text-white">
                  VentureSense <br />
                  Is a Premier <br />
                  Risk Engine <br />
                  <span className="inline-flex items-center">
                    Pr<div className="w-16 h-16 mx-1 border-2 border-[#A78BFA] rounded-full flex items-center justify-center p-2 shadow-[0_0_15px_rgba(167,139,250,0.4)]"><div className="w-full h-full border border-white/20 rounded-full flex items-center justify-center"><div className="w-3 h-3 bg-[#A78BFA] rounded-full shadow-[0_0_10px_#A78BFA]"></div></div></div>vider
                  </span>
                </h1>
              </div>
              
              <div className="flex flex-col gap-10 animate-fade-in-up-delay-2 pl-20">
                <div className="flex items-start gap-4">
                  <p className="text-2xl text-slate-200 font-black leading-relaxed max-w-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                    Renowned for powering the backbone of startup intelligence with our state-of-the-art SHAP-driven validation & AI directives.
                  </p>
                </div>
                
                <button onClick={handleStart} className="brand-button w-fit py-5 px-14 group">
                  Get In Touch <ArrowRight className="inline-block ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>
  

          <section className="max-w-7xl mx-auto px-10 mt-32 border-b border-white/5 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-[#0A0A0A] border-2 border-white/10 rounded-[3rem] p-16 flex flex-col justify-end min-h-[350px] relative overflow-hidden group hover:border-[#3B82F6]/50 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-8 left-8 w-2 h-2 bg-[#3B82F6] rounded-full shadow-[0_0_10px_#3B82F6]"></div>
                <div className="text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] mb-4">96k</div>
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Successful Predictions</div>
              </div>
            
            <div className="bg-[#0A0A0A] border-2 border-white/10 rounded-[3rem] p-16 flex flex-col justify-end min-h-[350px] relative overflow-hidden group hover:border-[#3B82F6]/50 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="absolute top-8 left-8 w-2 h-2 bg-white/10 rounded-full"></div>
              <div className="text-8xl font-black tracking-tighter text-white mb-4">1.2s</div>
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Inference Velocity</div>
            </div>

            <div className="bg-[#0A0A0A] border-2 border-white/10 rounded-[3rem] p-16 flex flex-col justify-end min-h-[350px] relative overflow-hidden group hover:border-[#A78BFA]/50 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="absolute top-8 left-8 w-2 h-2 bg-[#C4B5FD]/20 rounded-full"></div>
              <div className="text-8xl font-black tracking-tighter text-[#C4B5FD] mb-4">₹4B</div>
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Capital Analyzed</div>
            </div>
          </div>
        </section>


        <section className="max-w-7xl mx-auto px-10 mt-32 mb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
            <div>
              <h2 className="text-5xl font-bold tracking-tight mb-12 leading-tight">
                Financial Infrastructure <br />
                <span className="text-[#A78BFA]">Built For Intelligence.</span>
              </h2>
              <div className="space-y-12">
                {[
                  { title: "Risk Trace", desc: "Real-time probability variance based on recursive scenario testing." },
                  { title: "SHAP Drivers", desc: "Identify exact financial levers causing risk with explainable AI." },
                ].map((f, i) => (
                  <div key={i} className="flex gap-8 group">
                    <span className="text-[#A78BFA] font-black text-2xl mt-1">{"}"}</span>
                    <div>
                      <h3 className="text-xl font-bold mb-4 group-hover:text-[#A78BFA] transition-colors">{f.title}</h3>
                      <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-[#0A0A0A] border-2 border-white/10 rounded-[2.5rem] p-12 hover:border-[#A78BFA]/50 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="p-4 bg-[#111] border border-white/5 rounded-2xl text-[#A78BFA] w-fit mb-8 group-hover:bg-[#A78BFA] group-hover:text-[#0A0A0A] transition-all">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Oracle Core</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Tailored strategic directives for growth.</p>
              </div>
              <div className="bg-[#0A0A0A] border-2 border-white/10 rounded-[2.5rem] p-12 mt-12 hover:border-[#A78BFA]/50 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="p-4 bg-[#111] border border-white/5 rounded-2xl text-[#A78BFA] w-fit mb-8 group-hover:bg-[#A78BFA] group-hover:text-[#0A0A0A] transition-all">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Neural Engine</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Deep pattern recognition in burn cycles.</p>
              </div>
            </div>
          </div>
        </section>
      </main>


      <footer className="relative z-10 border-t-2 border-[#A78BFA]/40 shadow-[0_-4px_30px_rgba(167,139,250,0.1)] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-10 py-24">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#A78BFA]/20 blur-md rounded-full"></div>
                  <svg className="w-10 h-10 relative z-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 12L20 28L30 12" stroke="#A78BFA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20 28V32" stroke="#A78BFA" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="20" cy="28" r="3" fill="white" className="animate-pulse" />
                  </svg>
                </div>
                <span className="text-2xl font-black tracking-tighter text-white">
                  VentureSense
                </span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                The world's most advanced risk intelligence engine for elite venture builders and founders.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
              <div className="space-y-6">
                <div className="text-[10px] font-black text-[#A78BFA] uppercase tracking-[0.3em]">Platform</div>
                <div className="flex flex-col gap-4">
                  <a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Oracle Engine</a>
                  <a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Risk Trace</a>
                </div>
              </div>
              <div className="space-y-6">
                <div className="text-[10px] font-black text-[#A78BFA] uppercase tracking-[0.3em]">Company</div>
                <div className="flex flex-col gap-4">
                  <a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Terms</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">© 2026 VentureSense Intelligence. All rights reserved.</p>
            <div className="flex gap-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
