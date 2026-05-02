"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, X, Mail, Lock, User, CheckCircle2, Loader2 } from "lucide-react";

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
    try { const d = await api("/auth/verify-otp", { email:form.email, otp:form.otp }); localStorage.setItem("vs_token", d.token); localStorage.setItem("vs_user", JSON.stringify(d.user)); setSuccess("Authenticated! Redirecting..."); setTimeout(() => { close(); router.push("/dashboard"); }, 1000); } catch(e:any){ setError(e.message); } finally { setLoading(false); }
  };

  if (!open) return null;
  const inputCls = "w-full bg-[#080808] border border-white/5 rounded-xl py-4 px-6 text-white focus:outline-none focus:border-[#A78BFA]/50 focus:shadow-[0_0_20px_rgba(167,139,250,0.1)] transition-all placeholder:text-slate-700 font-medium";
  const btnCls = "brand-button w-full";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0A0A0A] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.9)] w-full max-w-md rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#A78BFA] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(167,139,250,0.4)]">
              <span className="text-[#080808] font-black text-xl">{"}"}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Security Core</h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">VentureSense Identity</p>
            </div>
          </div>
          <button onClick={close} className="text-slate-500 hover:text-white bg-[#111] p-2.5 rounded-xl border border-white/5 hover:border-white/20 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-10">
          {error && <div className="mb-8 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}
          {success && <div className="mb-8 p-4 bg-[#A78BFA]/5 border border-[#A78BFA]/20 rounded-2xl text-[#A78BFA] text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-3"><CheckCircle2 className="w-4 h-4" />{success}</div>}

          {mode === "options" && <div className="space-y-4">
            <button onClick={()=>setMode("login")} className="w-full p-6 rounded-[1.5rem] border border-white/5 bg-[#080808] hover:bg-[#111] hover:border-[#A78BFA]/30 shadow-inner transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs"><User className="w-5 h-5 text-[#A78BFA]" />Existing Intelligence</div>
              <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-[#A78BFA] group-hover:translate-x-1 transition-all" />
            </button>
            <button onClick={()=>setMode("signup")} className="w-full p-6 rounded-[1.5rem] border border-white/5 bg-[#080808] hover:bg-[#111] hover:border-[#A78BFA]/30 shadow-inner transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs"><Sparkles className="w-5 h-5 text-[#A78BFA]" />New Node Entry</div>
              <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-[#A78BFA] group-hover:translate-x-1 transition-all" />
            </button>
          </div>}

          {mode === "login" && <form onSubmit={onLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Node Identifier (Email)</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-700 absolute left-5 top-1/2 -translate-y-1/2" />
                <input type="email" required name="email" value={form.email} onChange={onChange} className={`${inputCls} pl-14`} placeholder="founder@nixtnode.com" />
              </div>
            </div>
            <button disabled={loading} className={btnCls}>{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Access OTP"}</button>
            <button type="button" onClick={()=>setMode("options")} className="w-full text-center text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors pt-4">Back to Protocols</button>
          </form>}

          {mode === "signup" && <form onSubmit={onSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">First</label>
                <input required name="name" value={form.name} onChange={onChange} className={inputCls} placeholder="John" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Last</label>
                <input required name="surname" value={form.surname} onChange={onChange} className={inputCls} placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-700 absolute left-5 top-1/2 -translate-y-1/2" />
                <input type="email" required name="email" value={form.email} onChange={onChange} className={`${inputCls} pl-14`} placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Credential</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-700 absolute left-5 top-1/2 -translate-y-1/2" />
                <input type="password" required name="password" value={form.password} onChange={onChange} className={`${inputCls} pl-14`} placeholder="••••••••" />
              </div>
            </div>
            <button disabled={loading} className={`${btnCls} mt-4`}>{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Initialize Node Entry"}</button>
            <button type="button" onClick={()=>setMode("options")} className="w-full text-center text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors pt-4">Back to Protocols</button>
          </form>}

          {mode === "otp" && <form onSubmit={onVerify} className="space-y-8">
            <div className="text-center space-y-2">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Protocol Verification Required</p>
              <p className="text-white font-mono text-sm tracking-tight">{form.email}</p>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-700 absolute left-5 top-1/2 -translate-y-1/2" />
              <input type="text" required name="otp" value={form.otp} onChange={onChange} maxLength={6} className={`${inputCls} pl-14 text-center tracking-[0.8em] text-xl font-mono`} placeholder="------" />
            </div>
            <button disabled={loading} className={btnCls}>{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Node"}</button>
            <button type="button" onClick={()=>setMode("options")} className="w-full text-center text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-colors pt-4">Abort Protocol</button>
          </form>}
        </div>
      </div>
    </div>
  );
}
