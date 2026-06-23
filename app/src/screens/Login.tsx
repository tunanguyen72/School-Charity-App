import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ShieldCheck, GraduationCap, Loader2 } from 'lucide-react'
import { Button, inputCls } from '../ui'
import { useApp } from '../store'

export default function Login() {
  const nav = useNavigate()
  const { login, register, quickLogin } = useApp()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('huong@example.com')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true); setError('')
    try {
      if (mode === 'login') await login(email, password)
      else {
        if (!fullName.trim()) throw new Error('Vui lòng nhập họ tên')
        await register(fullName, email, password)
      }
      nav('/home')
    } catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  const doQuick = async (r: 'donor' | 'tnv' | 'admin') => {
    setBusy(true); setError('')
    try { await quickLogin(r); nav(r === 'tnv' ? '/inventory' : '/home') }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  const switchMode = (m: 'login' | 'register') => {
    setMode(m); setError('')
    if (m === 'register') { setEmail(''); setPassword('') }
    else { setEmail('huong@example.com'); setPassword('123456') }
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-brand-50 to-white flex flex-col">
      <div className="pt-12 px-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center shadow-lg shadow-brand-600/30">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div className="text-brand-700 font-extrabold text-xl mt-3">Cùng em đến trường</div>
        <div className="mt-5 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center shadow-xl shadow-brand-600/20 relative overflow-hidden">
          <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full bg-white/15" />
          <span className="text-5xl">🏫</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 mt-5">{mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h1>
        <p className="text-slate-500 text-sm mt-1 px-2">{mode === 'login' ? 'Đăng nhập để tiếp tục đồng hành cùng các chiến dịch.' : 'Đăng ký để bắt đầu hành trình thiện nguyện của bạn.'}</p>
      </div>

      {/* Tab switch */}
      <div className="mx-6 mt-5 grid grid-cols-2 bg-slate-200/70 rounded-2xl p-1">
        <button onClick={() => switchMode('login')} className={`py-2 rounded-xl text-sm font-bold transition ${mode === 'login' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'}`}>Đăng nhập</button>
        <button onClick={() => switchMode('register')} className={`py-2 rounded-xl text-sm font-bold transition ${mode === 'register' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'}`}>Đăng ký</button>
      </div>

      <div className="px-6 mt-4 space-y-3">
        {mode === 'register' && (
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input className={inputCls + ' pl-11'} placeholder="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
        )}
        <div className="relative">
          <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input className={inputCls + ' pl-11'} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="relative">
          <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="password" className={inputCls + ' pl-11'} placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>
        {error && <div className="text-rose-600 text-[13px] text-center">{error}</div>}
        <Button onClick={submit} disabled={busy}>{busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</Button>

        {mode === 'login' && (
          <>
            <div className="flex items-center gap-3 text-slate-400 text-xs py-1">
              <div className="h-px flex-1 bg-slate-200" /> Đăng nhập nhanh (demo) <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => doQuick('donor')} disabled={busy} className="py-2.5 rounded-xl text-xs font-bold border border-brand-200 text-brand-700 bg-white active:bg-brand-50">Nhà hảo tâm</button>
              <button onClick={() => doQuick('tnv')} disabled={busy} className="py-2.5 rounded-xl text-xs font-bold border border-brand-200 text-brand-700 bg-white active:bg-brand-50">TNV</button>
              <button onClick={() => doQuick('admin')} disabled={busy} className="py-2.5 rounded-xl text-xs font-bold border border-brand-200 text-brand-700 bg-white active:bg-brand-50">Admin</button>
            </div>
          </>
        )}

        <div className="flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 rounded-2xl py-3 text-[13px] font-semibold mt-2">
          <ShieldCheck className="w-4 h-4" /> Nền tảng quyên góp minh bạch & xác thực
        </div>
        <p className="text-center text-xs text-slate-400 pb-6">
          {mode === 'login' ? (
            <>Chưa có tài khoản? <button onClick={() => switchMode('register')} className="text-brand-600 font-bold">Đăng ký ngay</button></>
          ) : (
            <>Đã có tài khoản? <button onClick={() => switchMode('login')} className="text-brand-600 font-bold">Đăng nhập</button></>
          )}
        </p>
      </div>
    </div>
  )
}
