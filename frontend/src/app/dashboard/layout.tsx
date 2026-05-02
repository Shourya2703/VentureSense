"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActivitySquare, LayoutDashboard, Box, ArrowLeft, BookOpen, Sparkles, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vs_token");
    if (!token) {
      router.push("/");
    } else {
      setAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("vs_token");
    localStorage.removeItem("vs_user");
    router.push("/");
  };

  const navItems = [
    { name: "Simulator", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Scenarios", href: "/dashboard/scenarios", icon: <Box className="w-5 h-5" /> },
    { name: "Methodology", href: "/dashboard/methodology", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Oracle Advisory", href: "/dashboard/advisory", icon: <Sparkles className="w-5 h-5" /> },
  ];

  if (!authenticated) return <div className="min-h-screen bg-[#080808] flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-[#A78BFA]/20 border-t-[#A78BFA] rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#080808] text-white flex relative overflow-hidden">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#080808]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A78BFA] opacity-[0.05] blur-[150px]" />
      </div>

      <aside className="w-72 border-r border-white/10 shadow-[4px_0_30px_rgba(0,0,0,0.5)] hidden md:flex flex-col bg-[#0A0A0A] relative z-20">
        <div className="h-24 flex items-center px-8 border-b-2 border-[#A78BFA]/40 relative z-10">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#A78BFA]/20 blur-md rounded-full group-hover:animate-pulse"></div>
              <svg className="w-8 h-8 relative z-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L20 28L30 12" stroke="#A78BFA" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 28V32" stroke="#A78BFA" strokeWidth="5" strokeLinecap="round" />
                <circle cx="20" cy="28" r="3" fill="white" className="animate-pulse" />
              </svg>
            </div>
            <span className="font-black tracking-tighter text-xl text-white flex items-center">
              VentureSense
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 py-10 px-6 space-y-3 relative z-10">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-8 px-4">Intelligence Core</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive 
                    ? "bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/40 shadow-[0_0_20px_rgba(167,139,250,0.1)]" 
                    : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                }`}
              >
                <div className={`transition-colors duration-300 ${isActive ? "text-[#A78BFA]" : "text-slate-600 group-hover:text-white"}`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/10 relative z-10 space-y-4">
          <Link href="/" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-[#A78BFA] transition-all px-6 py-4 bg-[#080808] rounded-xl border border-white/5 hover:border-[#A78BFA]/30">
            <ArrowLeft className="w-4 h-4" /> Terminal
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-rose-500 transition-all px-6 py-4 bg-[#080808] rounded-xl border border-white/5 hover:border-rose-500/30">
            <LogOut className="w-4 h-4" /> Disconnect
          </button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-y-auto z-10 flex flex-col">
        <div className="h-24 border-b-2 border-[#A78BFA]/40 bg-[#080808]/50 backdrop-blur-xl sticky top-0 z-30 flex items-center px-10 shadow-[0_4px_30px_rgba(167,139,250,0.05)]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#A78BFA] animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Secure Node Environment</span>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#A78BFA]/5 blur-[150px] pointer-events-none" />
          {children}
        </div>
      </main>
    </div>
  );
}
