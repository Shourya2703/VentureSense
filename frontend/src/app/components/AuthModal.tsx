"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActivitySquare, ArrowRight, Sparkles, X, Mail, Lock, User, CheckCircle2, Loader2 } from "lucide-react";

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"options"|"login"|"signup"|"otp">("options");
  const [form, setForm] = useState({ name:"", surname:"", email:"", password:"", otp:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const reset = () => { setMode("options"); setForm({ name:"",surname:"",email:"",password:"",otp:"" }); setError(""); setSuccess(""); };
  const close = () => { onClose(); setTimeout(reset, 300); };

  const api = async (url: string, body: any) => {
    const r = await fetch(`http://127.0.0.1:8000${url}`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    const d = await r.json(); if (!r.ok) throw new Error(d.detail||"Error"); return d;
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await api("/auth/signup", { name:form.name, surname:form.surname, email:form.email, password:form.password }); await api("/auth/send-otp", { email:form.email }); setMode("otp"); setSuccess("OTP sent to your email!"); } catch(e:any){ setError(e.message); } finally { setLoading(false); }
  };
  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await api("/auth/login", { email:form.email }); await api("/auth/send-otp", { email:form.email }); setMode("otp"); setSuccess("OTP sent to your email!"); } catch(e:any){ setError(e.message); } finally { setLoading(false); }
  };
  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try { const d = await api("/auth/verify-otp", { email:form.email, otp:form.otp }); localStorage.setItem("vs_token", d.token); setSuccess("Authenticated! Redirecting..."); setTimeout(() => { close(); router.push("/dashboard"); }, 1000); } catch(e:any){ setError(e.message); } finally { setLoading(false); }
  };

  if (!open) return null;
  const inputCls = "w-full bg-slate-900 border border-emerald-500/30 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all";
  const btnCls = "w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex justify-center items-center gap-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-scale-in" style={{animationDuration:"0.25s"}}>
      <div className="bg-slate-950 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.3)] w-full max-w-md rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center bg-emerald-500/5">
          <div className="flex items-center gap-3"><div className="p-1.5 bg-slate-900 rounded-lg border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"><Sparkles className="w-5 h-5 text-emerald-400" /></div><h2 className="text-lg font-bold text-white">VentureSense Auth</h2></div>
          <button onClick={close} className="text-slate-400 hover:text-white bg-slate-900 p-1.5 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8">
          {error && <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm font-medium text-center">{error}</div>}
          {success && <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-medium text-center flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}

          {mode === "options" && <div className="space-y-4">
            <button onClick={()=>setMode("login")} className="w-full p-4 rounded-xl border border-emerald-500/30 bg-slate-900 hover:bg-slate-800 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-between group"><div className="flex items-center gap-3 text-white font-bold"><User className="w-5 h-5 text-emerald-400" />Existing User</div><ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" /></button>
            <button onClick={()=>setMode("signup")} className="w-full p-4 rounded-xl border border-emerald-500/30 bg-slate-900 hover:bg-slate-800 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-between group"><div className="flex items-center gap-3 text-white font-bold"><Sparkles className="w-5 h-5 text-emerald-400" />New User (Sign Up)</div><ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" /></button>
          </div>}

          {mode === "login" && <form onSubmit={onLogin} className="space-y-5">
            <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gmail ID</label><div className="relative"><Mail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" /><input type="email" required name="email" value={form.email} onChange={onChange} className={`${inputCls} pl-10`} placeholder="john@gmail.com" /></div></div>
            <button disabled={loading} className={btnCls}>{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}</button>
            <button type="button" onClick={()=>setMode("options")} className="w-full text-center text-sm text-slate-500 hover:text-white transition-colors">Back</button>
          </form>}

          {mode === "signup" && <form onSubmit={onSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</label><input required name="name" value={form.name} onChange={onChange} className={inputCls} placeholder="John" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Surname</label><input required name="surname" value={form.surname} onChange={onChange} className={inputCls} placeholder="Doe" /></div>
            </div>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gmail ID</label><div className="relative"><Mail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" /><input type="email" required name="email" value={form.email} onChange={onChange} className={`${inputCls} pl-10`} placeholder="john@gmail.com" /></div></div>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label><div className="relative"><Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" /><input type="password" required name="password" value={form.password} onChange={onChange} className={`${inputCls} pl-10`} placeholder="••••••••" /></div></div>
            <button disabled={loading} className={`${btnCls} mt-2`}>{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account & Send OTP"}</button>
            <button type="button" onClick={()=>setMode("options")} className="w-full text-center text-sm text-slate-500 hover:text-white transition-colors">Back</button>
          </form>}

          {mode === "otp" && <form onSubmit={onVerify} className="space-y-5">
            <div className="text-center mb-2"><p className="text-slate-400 text-sm">Enter the 6-digit code sent to</p><p className="text-emerald-400 font-bold">{form.email}</p></div>
            <div className="relative"><Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" required name="otp" value={form.otp} onChange={onChange} maxLength={6} className={`${inputCls} pl-10 text-center tracking-[0.5em] text-lg font-mono`} placeholder="------" /></div>
            <button disabled={loading} className={btnCls}>{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}</button>
            <button type="button" onClick={()=>setMode("options")} className="w-full text-center text-sm text-slate-500 hover:text-white transition-colors">Cancel</button>
          </form>}
        </div>
      </div>
    </div>
  );
}
