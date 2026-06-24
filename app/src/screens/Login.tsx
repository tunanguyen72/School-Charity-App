import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ShieldCheck, GraduationCap, Loader2, HeartHandshake, HandHelping, ChevronLeft } from 'lucide-react'
import { Button, inputCls } from '../ui'
import { useApp } from '../store'

type Mode = 'login' | 'register' | 'admin'

export default function Login() {
  const nav = useNavigate()
  const { login, register } = useApp()
  const [mode, setMode] = useState<Mode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [regRole, setRegRole] = useState<'donor' | 'tnv'>('donor')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const go = (u: { role: string }) => nav(u.role === 'admin' ? '/admin' : '/home')

  const submit = async () => {
    setBusy(true); setError('')
    try {
      if (mode === 'register') {
        if (!fullName.trim()) throw new Error('Vui lòng nhập họ tên')
        go(await register(fullName, email, password, regRole))
      } else {
        go(await login(email, password))
      }
    } catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }

  const switchMode = (m: Mode) => {
    setMode(m); setError(''); setFullName('')
    if (m === 'admin') { setEmail('admin@gmail.com'); setPassword('123456') }
    else { setEmail(''); setPassword('') }
  }

  // ===== Chế độ Quản trị (tài khoản riêng) =====
  if (mode === 'admin')
    return (
      <div className="min-h-[100svh] bg-gradient-to-b from-slate-900 to-brand-900 flex flex-col text-white">
        <button onClick={() => switchMode('login')} className="flex items-center gap-1 text-white/70 text-sm px-5 pt-6"><ChevronLeft className="w-5 h-5" /> Quay lại</button>
        <div className="px-6 text-center mt-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-white/10 grid place-items-center"><ShieldCheck className="w-8 h-8 text-emerald-400" /></div>
          <h1 className="text-2xl font-extrabold mt-4">Đăng nhập Quản trị</h1>
          <p className="text-white/60 text-sm mt-1">Khu vực dành riêng cho ban quản trị hệ thống.</p>
        </div>
        <div className="px-6 mt-7 space-y-3">
          <div className="relative">
            <Mail className="w-5 h-5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/40 outline-none focus:border-white/40" placeholder="Email quản trị" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="password" className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-white/40 outline-none focus:border-white/40" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
          {error && <div className="text-rose-300 text-[13px] text-center">{error}</div>}
          <button onClick={submit} disabled={busy} className="w-full rounded-2xl py-3.5 font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 active:scale-[.98] flex items-center justify-center gap-2">
            {busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : 'Đăng nhập quản trị'}
          </button>
        </div>
      </div>
    )

  // ===== Đăng nhập / Đăng ký =====
  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-brand-50 to-white flex flex-col">
      <div className="pt-12 px-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center shadow-lg shadow-brand-600/30">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div className="text-brand-700 font-extrabold text-xl mt-3">Cùng em đến trường</div>
        <h1 className="text-2xl font-extrabold text-slate-800 mt-4">{mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h1>
        <p className="text-slate-500 text-sm mt-1 px-2">{mode === 'login' ? 'Đăng nhập để tiếp tục đồng hành cùng các chiến dịch.' : 'Chọn vai trò để bắt đầu hành trình thiện nguyện.'}</p>
      </div>

      <div className="mx-6 mt-5 grid grid-cols-2 bg-slate-200/70 rounded-2xl p-1">
        <button onClick={() => switchMode('login')} className={`py-2 rounded-xl text-sm font-bold transition ${mode === 'login' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'}`}>Đăng nhập</button>
        <button onClick={() => switchMode('register')} className={`py-2 rounded-xl text-sm font-bold transition ${mode === 'register' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'}`}>Đăng ký</button>
      </div>

      <div className="px-6 mt-4 space-y-3">
        {mode === 'register' && (
          <>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input className={inputCls + ' pl-11'} placeholder="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </>
        )}
        <div className="relative">
          <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input className={inputCls + ' pl-11'} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="relative">
          <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="password" className={inputCls + ' pl-11'} placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>

        {mode === 'register' && (
          <div>
            <div className="text-[13px] font-semibold text-slate-600 mb-2">Bạn đăng ký với vai trò</div>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setRegRole('donor')} className={`p-3 rounded-2xl border-[1.5px] text-left transition ${regRole === 'donor' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'}`}>
                <HeartHandshake className={`w-5 h-5 ${regRole === 'donor' ? 'text-brand-600' : 'text-slate-400'}`} />
                <div className={`font-bold text-sm mt-1.5 ${regRole === 'donor' ? 'text-brand-700' : 'text-slate-700'}`}>Nhà hảo tâm</div>
                <div className="text-[11px] text-slate-400">Quyên góp, theo dõi minh bạch</div>
              </button>
              <button onClick={() => setRegRole('tnv')} className={`p-3 rounded-2xl border-[1.5px] text-left transition ${regRole === 'tnv' ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'}`}>
                <HandHelping className={`w-5 h-5 ${regRole === 'tnv' ? 'text-brand-600' : 'text-slate-400'}`} />
                <div className={`font-bold text-sm mt-1.5 ${regRole === 'tnv' ? 'text-brand-700' : 'text-slate-700'}`}>Tình nguyện viên</div>
                <div className="text-[11px] text-slate-400">Ghi nhận & phân phối hiện vật</div>
              </button>
            </div>
          </div>
        )}

        {error && <div className="text-rose-600 text-[13px] text-center">{error}</div>}
        <Button onClick={submit} disabled={busy}>{busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</Button>

        <div className="flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 rounded-2xl py-3 text-[13px] font-semibold mt-1">
          <ShieldCheck className="w-4 h-4" /> Nền tảng quyên góp minh bạch & xác thực
        </div>

        <p className="text-center text-xs text-slate-400">
          {mode === 'login'
            ? <>Chưa có tài khoản? <button onClick={() => switchMode('register')} className="text-brand-600 font-bold">Đăng ký ngay</button></>
            : <>Đã có tài khoản? <button onClick={() => switchMode('login')} className="text-brand-600 font-bold">Đăng nhập</button></>}
        </p>
        <button onClick={() => switchMode('admin')} className="w-full flex items-center justify-center gap-1.5 text-slate-400 text-xs pb-6 active:text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5" /> Đăng nhập với tư cách Quản trị
        </button>
      </div>
    </div>
  )
}
