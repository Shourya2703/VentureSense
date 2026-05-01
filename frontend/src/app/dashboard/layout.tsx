"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActivitySquare, LayoutDashboard, Box, ArrowLeft, BookOpen, Sparkles } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Simulator", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Scenarios", href: "/dashboard/scenarios", icon: <Box className="w-5 h-5" /> },
    { name: "Methodology", href: "/dashboard/methodology", icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex relative overflow-hidden">
      
      {/* Global Background Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#064e3b]/40 via-slate-950 to-slate-950 opacity-80" />
      </div>

      {/* Sidebar with Emerald Glow */}
      <aside className="w-64 border-r border-emerald-500/20 shadow-[4px_0_20px_rgba(16,185,129,0.05)] hidden md:flex flex-col bg-slate-950/60 backdrop-blur-xl relative z-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>
        
        <div className="h-20 flex items-center px-6 border-b border-emerald-500/20 shadow-[0_4px_15px_rgba(16,185,129,0.05)] relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-1.5 bg-slate-900 rounded-lg border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)] group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/30 transition-colors"></div>
              <Sparkles className="w-5 h-5 text-emerald-400 relative z-10" />
            </div>
            <span className="font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] group-hover:text-emerald-400 transition-colors">VentureSense</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 relative z-10">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Menu</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-500/20 relative z-10">
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-400 transition-colors px-2 py-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none" />
        {children}
      </main>
    </div>
  );
}
