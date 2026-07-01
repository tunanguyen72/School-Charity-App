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
    <div className="relative min-h-[100svh] app-canvas flex flex-col overflow-hidden">
      {/* Hoạ tiết nền mềm tạo chiều sâu */}
      <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-32 -left-24 w-72 h-72 rounded-full bg-warm-400/20 blur-3xl" />

      <div className="relative pt-14 px-6 text-center">
        <div className="w-[68px] h-[68px] mx-auto rounded-[22px] bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center shadow-brand ring-1 ring-white/40">
          <GraduationCap className="w-9 h-9 text-white" />
        </div>
        <div className="mt-3 font-extrabold text-xl text-gradient">Cùng em đến trường</div>
        <h1 className="text-[26px] leading-tight font-extrabold text-ink-900 mt-5 tracking-tight">{mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</h1>
        <p className="text-ink-500 text-sm mt-1.5 px-2">{mode === 'login' ? 'Đăng nhập để tiếp tục đồng hành cùng các chiến dịch.' : 'Chọn vai trò để bắt đầu hành trình thiện nguyện.'}</p>
      </div>

      <div className="relative mx-6 mt-6 grid grid-cols-2 bg-white/70 ring-1 ring-slate-900/5 rounded-2xl p-1 shadow-soft">
        <button onClick={() => switchMode('login')} className={`py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-brand-700 shadow-card' : 'text-ink-500'}`}>Đăng nhập</button>
        <button onClick={() => switchMode('register')} className={`py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'register' ? 'bg-white text-brand-700 shadow-card' : 'text-ink-500'}`}>Đăng ký</button>
      </div>

      <div className="relative px-6 mt-4 space-y-3">
        {mode === 'register' && (
          <>
            <div className="relative">
              <User className="w-5 h-5 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input className={inputCls + ' pl-11'} placeholder="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </>
        )}
        <div className="relative">
          <Mail className="w-5 h-5 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input className={inputCls + ' pl-11'} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="relative">
          <Lock className="w-5 h-5 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="password" className={inputCls + ' pl-11'} placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>

        {mode === 'register' && (
          <div>
            <div className="text-[13px] font-semibold text-ink-500 mb-2">Bạn đăng ký với vai trò</div>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { key: 'donor', Icon: HeartHandshake, title: 'Nhà hảo tâm', desc: 'Quyên góp, theo dõi minh bạch' },
                { key: 'tnv', Icon: HandHelping, title: 'Tình nguyện viên', desc: 'Ghi nhận & phân phối hiện vật' },
              ] as const).map(({ key, Icon, title, desc }) => {
                const on = regRole === key
                return (
                  <button key={key} onClick={() => setRegRole(key)}
                    className={`relative p-3.5 rounded-2xl text-left transition-all ${on ? 'bg-brand-50 ring-2 ring-brand-500 shadow-card' : 'bg-white ring-1 ring-slate-200'}`}>
                    <span className={`grid place-items-center w-9 h-9 rounded-xl ${on ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-400'}`}><Icon className="w-5 h-5" /></span>
                    <div className={`font-bold text-sm mt-2 ${on ? 'text-brand-700' : 'text-ink-700'}`}>{title}</div>
                    <div className="text-[11px] text-ink-400 leading-snug mt-0.5">{desc}</div>
                    {on && <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-brand-500 ring-2 ring-white" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {error && <div className="text-rose-600 text-[13px] text-center bg-rose-50 rounded-xl py-2 ring-1 ring-rose-100">{error}</div>}
        <Button onClick={submit} disabled={busy}>{busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</Button>

        <div className="flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 rounded-2xl py-3 text-[13px] font-semibold mt-1 ring-1 ring-emerald-100">
          <ShieldCheck className="w-4 h-4" /> Nền tảng quyên góp minh bạch & xác thực
        </div>

        <p className="text-center text-xs text-ink-400">
          {mode === 'login'
            ? <>Chưa có tài khoản? <button onClick={() => switchMode('register')} className="text-brand-600 font-bold">Đăng ký ngay</button></>
            : <>Đã có tài khoản? <button onClick={() => switchMode('login')} className="text-brand-600 font-bold">Đăng nhập</button></>}
        </p>
        <button onClick={() => switchMode('admin')} className="w-full flex items-center justify-center gap-1.5 text-ink-400 text-xs pb-6 active:text-ink-600">
          <ShieldCheck className="w-3.5 h-3.5" /> Đăng nhập với tư cách Quản trị
        </button>
      </div>
    </div>
  )
}
