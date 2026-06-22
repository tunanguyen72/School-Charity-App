import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ShieldCheck, GraduationCap, Loader2 } from 'lucide-react'
import { Button, inputCls } from '../ui'
import { useApp } from '../store'

export default function Login() {
  const nav = useNavigate()
  const { login, quickLogin } = useApp()
  const [email, setEmail] = useState('huong@example.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const doLogin = async () => {
    setBusy(true); setError('')
    try { await login(email, password); nav('/home') }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  const doQuick = async (r: 'donor' | 'tnv' | 'admin') => {
    setBusy(true); setError('')
    try { await quickLogin(r); nav(r === 'tnv' ? '/inventory' : '/home') }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-brand-50 to-white flex flex-col">
      <div className="pt-14 px-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center shadow-lg shadow-brand-600/30">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div className="text-brand-700 font-extrabold text-xl mt-3">Cùng em đến trường</div>
        <div className="mt-6 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center shadow-xl shadow-brand-600/20 relative overflow-hidden">
          <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full bg-white/15" />
          <span className="text-6xl">🏫</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 mt-5">Chào mừng trở lại</h1>
        <p className="text-slate-500 text-sm mt-1 px-2">Đăng nhập để tiếp tục đồng hành cùng các chiến dịch giáo dục.</p>
      </div>

      <div className="px-6 mt-5 space-y-3">
        <div className="relative">
          <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input className={inputCls + ' pl-11'} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="relative">
          <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="password" className={inputCls + ' pl-11'} placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doLogin()} />
        </div>
        {error && <div className="text-rose-600 text-[13px] text-center">{error}</div>}
        <Button onClick={doLogin} disabled={busy}>{busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : 'Đăng nhập'}</Button>

        <div className="flex items-center gap-3 text-slate-400 text-xs py-1">
          <div className="h-px flex-1 bg-slate-200" /> Đăng nhập nhanh (demo) <div className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => doQuick('donor')} disabled={busy} className="py-2.5 rounded-xl text-xs font-bold border border-brand-200 text-brand-700 bg-white active:bg-brand-50">Nhà hảo tâm</button>
          <button onClick={() => doQuick('tnv')} disabled={busy} className="py-2.5 rounded-xl text-xs font-bold border border-brand-200 text-brand-700 bg-white active:bg-brand-50">TNV</button>
          <button onClick={() => doQuick('admin')} disabled={busy} className="py-2.5 rounded-xl text-xs font-bold border border-brand-200 text-brand-700 bg-white active:bg-brand-50">Admin</button>
        </div>

        <div className="flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 rounded-2xl py-3 text-[13px] font-semibold mt-3">
          <ShieldCheck className="w-4 h-4" /> Nền tảng quyên góp minh bạch & xác thực
        </div>
        <p className="text-center text-xs text-slate-400 pb-6">CÙNG EM ĐẾN TRƯỜNG © 2024</p>
      </div>
    </div>
  )
}
