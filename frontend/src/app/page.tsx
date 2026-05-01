"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ActivitySquare, ArrowRight, Sparkles, Box, Rocket, TrendingUp, BarChart3, BrainCircuit, ShieldCheck, Target } from "lucide-react";
import AuthModal from "./components/AuthModal";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-10");
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function ScrollSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`opacity-0 translate-y-10 transition-all duration-700 ease-out ${className}`}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <div className="min-h-screen font-sans selection:bg-emerald-500/30 flex flex-col relative overflow-hidden bg-black">
      {/* Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#064e3b] via-black to-black opacity-80" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/20 blur-[120px] animate-[spin_30s_linear_infinite] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/15 blur-[120px] animate-[spin_25s_linear_infinite_reverse] mix-blend-screen" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-green-500/10 blur-[100px] animate-float mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_60%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-emerald-500/40 shadow-[0_4px_30px_rgba(16,185,129,0.15)] bg-black/60 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-black/50 rounded-xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all animate-glow-pulse">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">VentureSense</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors hidden md:block">Dashboard</Link>
            <Link href="/dashboard/scenarios" className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors hidden md:block">Scenarios</Link>
            <Link href="/dashboard/methodology" className="text-sm font-semibold text-slate-300 hover:text-emerald-400 transition-colors hidden md:block">Methodology</Link>
            <button onClick={() => setAuthOpen(true)} className="inline-flex h-10 items-center justify-center rounded-xl px-6 text-sm font-bold text-white gap-2 bg-black border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:border-emerald-400 transition-all">
              Sign In <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero: Text Left, Image Right */}
      <section className="max-w-7xl mx-auto px-6 relative z-10 mt-20 md:mt-32 pb-20">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Left: Text */}
          <div className="flex-1 text-left">
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-sm font-medium text-emerald-300 mb-8 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-emerald-400" /> AI-Powered Risk Engine v2.0
            </div>
            <h1 className="animate-fade-in-up-delay-1 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-[1.05]">
              Predict business{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400">
                failure before it happens.
              </span>
            </h1>
            <p className="animate-fade-in-up-delay-2 text-lg md:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed">
              Harness ML &amp; Generative AI to stress-test financial scenarios and secure your startup&#39;s future.
            </p>
            <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row items-start gap-4">
              <button onClick={() => setAuthOpen(true)} className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-lg rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] flex items-center gap-3 border border-emerald-400/50">
                Get Started <Rocket className="w-5 h-5" />
              </button>
              <Link href="/dashboard/scenarios" className="px-8 py-4 bg-slate-900/50 backdrop-blur-md border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-white font-bold text-lg rounded-2xl hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center gap-3">
                <Box className="w-5 h-5 text-emerald-400" /> Scenarios
              </Link>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="flex-1 animate-fade-in-up-delay-2 relative">
            <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.25)] animate-float">
              <Image
                src="/venture_hero_v2.png"
                alt="VentureSense AI"
                width={800}
                height={800}
                className="w-full h-auto object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
            {/* Decorative floating badges */}
            <div className="absolute -top-4 -right-4 bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-float-delayed hidden lg:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-xs font-bold text-emerald-300">Live Predictions</span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-float hidden lg:flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">92.8% Accurate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar — Scroll Reveal */}
      <section className="max-w-5xl mx-auto w-full px-6 mb-28 relative z-10">
        <ScrollSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Model Accuracy", value: "92.8%", icon: <Target className="w-4 h-4 text-emerald-400" /> },
              { label: "ROC-AUC", value: "0.935", icon: <BarChart3 className="w-4 h-4 text-teal-400" /> },
              { label: "Features", value: "10+", icon: <BrainCircuit className="w-4 h-4 text-green-400" /> },
              { label: "AI Engine", value: "Gemini", icon: <Sparkles className="w-4 h-4 text-emerald-300" /> },
            ].map((s, i) => (
              <div key={i} className="bg-black/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-5 text-center hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all group">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <div className="text-2xl font-black text-white mb-1 group-hover:text-emerald-400 transition-colors">{s.value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </ScrollSection>
      </section>

      {/* How It Works — Scroll Reveal */}
      <section className="max-w-6xl mx-auto w-full px-6 mb-28 relative z-10">
        <ScrollSection>
          <h2 className="text-3xl md:text-4xl font-black text-left text-white mb-4">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Works</span>
          </h2>
          <p className="text-slate-400 text-left mb-12 max-w-xl">Three stages of intelligent financial risk analysis.</p>
        </ScrollSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <TrendingUp className="w-7 h-7 text-emerald-400" />, step: "01", title: "Simulate", desc: "Adjust financial variables with interactive sliders and see the risk prediction update in real-time." },
            { icon: <BarChart3 className="w-7 h-7 text-green-400" />, step: "02", title: "Explain", desc: "SHAP values decompose the model's decision, showing which features drive the risk score." },
            { icon: <BrainCircuit className="w-7 h-7 text-teal-400" />, step: "03", title: "Strategize", desc: "Google Gemini AI transforms raw analytics into a personalized action plan." },
          ].map((f, i) => (
            <ScrollSection key={i}>
              <div className="bg-black/40 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] p-8 rounded-3xl hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-black/80 rounded-2xl border border-emerald-500/50 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">{f.icon}</div>
                    <span className="text-5xl font-black text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">{f.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
                </div>
              </div>
            </ScrollSection>
          ))}
        </div>
      </section>

      {/* CTA Banner — Scroll Reveal */}
      <section className="max-w-4xl mx-auto w-full px-6 mb-28 relative z-10">
        <ScrollSection>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 p-[1px] shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <div className="bg-black/80 backdrop-blur-xl rounded-[23px] p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-black rounded-2xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-float">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Ready to protect your startup?</h3>
                  <p className="text-emerald-100/70 text-sm">Jump in and run your first AI risk simulation.</p>
                </div>
              </div>
              <button onClick={() => setAuthOpen(true)} className="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 shrink-0">
                Sign Up Free <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </ScrollSection>
      </section>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-emerald-500/30 shadow-[0_-4px_20px_rgba(16,185,129,0.1)] mt-auto relative z-10 bg-black/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 group cursor-pointer">
            <Sparkles className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
            <span className="font-bold text-emerald-500 group-hover:text-emerald-400 transition-colors">VentureSense</span>
          </div>
          <p className="text-sm font-medium text-slate-500">&copy; {new Date().getFullYear()} VentureSense AI.</p>
        </div>
      </footer>
    </div>
  );
}
