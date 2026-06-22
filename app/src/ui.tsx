import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Loader2 } from 'lucide-react'

export function Loading({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
      <Loader2 className="w-7 h-7 animate-spin-slow" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="mx-4 mt-4 rounded-2xl bg-rose-50 text-rose-600 text-sm p-4 text-center">⚠️ {message}</div>
}

type BtnVariant = 'primary' | 'ghost' | 'soft' | 'success' | 'white'
const btnStyles: Record<BtnVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 active:scale-[.98]',
  ghost: 'bg-white text-brand-700 border border-brand-200 active:bg-brand-50',
  soft: 'bg-brand-50 text-brand-700 active:bg-brand-100',
  success: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 active:scale-[.98]',
  white: 'bg-white text-brand-700 shadow active:scale-[.98]',
}

export function Button({
  children, variant = 'primary', className = '', ...rest
}: { children: ReactNode; variant?: BtnVariant } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`w-full rounded-2xl py-3.5 font-bold text-[15px] transition flex items-center justify-center gap-2 ${btnStyles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={`bg-white rounded-3xl p-4 shadow-sm shadow-slate-200/70 ${className}`}>
      {children}
    </div>
  )
}

const badgeTones: Record<string, string> = {
  red: 'bg-rose-100 text-rose-600',
  green: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-brand-100 text-brand-700',
  amber: 'bg-amber-100 text-amber-700',
  slate: 'bg-slate-100 text-slate-600',
}
export function Badge({ tone = 'blue', children, className = '' }: { tone?: keyof typeof badgeTones; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${badgeTones[tone]} ${className}`}>{children}</span>
}

export function Progress({ value, tone = 'bg-brand-600' }: { value: number; tone?: string }) {
  return (
    <div className="h-2 rounded-full bg-slate-200/80 overflow-hidden">
      <div className={`h-full rounded-full ${tone} transition-all`} style={{ width: `${value}%` }} />
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 mt-5 mb-2">
      <h2 className="text-base font-extrabold text-slate-800">{children}</h2>
      {action}
    </div>
  )
}

export function TopBar({ title, back, right }: { title: ReactNode; back?: boolean | string; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100 px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        {back && (
          <button onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))} className="-ml-1 p-1 rounded-full active:bg-slate-100">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
        )}
        <div className="font-bold text-slate-800 truncate">{title}</div>
      </div>
      <div className="flex items-center gap-1 text-slate-500">{right}</div>
    </div>
  )
}

export function Avatar({ initials, className = '' }: { initials: string; className?: string }) {
  return (
    <div className={`rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white grid place-items-center font-bold ${className || 'w-10 h-10'}`}>
      {initials}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block px-5 mb-3">
      <span className="block text-[13px] font-semibold text-slate-600 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-[14px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition'

export function Banner({ gradient, emoji, h = 'h-40' }: { gradient: string; emoji: string; h?: string }) {
  return (
    <div className={`relative ${h} bg-gradient-to-br ${gradient} overflow-hidden grid place-items-center`}>
      <div className="absolute -right-6 -top-8 w-32 h-32 rounded-full bg-white/15" />
      <div className="absolute -left-8 -bottom-10 w-40 h-40 rounded-full bg-black/10" />
      <span className="text-6xl drop-shadow-lg relative">{emoji}</span>
    </div>
  )
}
