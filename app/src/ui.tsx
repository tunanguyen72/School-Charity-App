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

// Khối skeleton cho trạng thái tải — chuyên nghiệp hơn spinner trống
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="mx-4 mt-4 rounded-2xl bg-rose-50 text-rose-600 text-sm p-4 text-center ring-1 ring-rose-100">⚠️ {message}</div>
}

type BtnVariant = 'primary' | 'ghost' | 'soft' | 'success' | 'white'
const btnStyles: Record<BtnVariant, string> = {
  primary: 'text-white bg-gradient-to-b from-brand-500 to-brand-600 shadow-brand hover:brightness-[1.03] active:scale-[.985]',
  ghost: 'bg-white text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-50 active:bg-brand-100',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-100',
  success: 'text-white bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_8px_24px_-8px_rgba(16,163,74,.5)] hover:brightness-[1.03] active:scale-[.985]',
  white: 'bg-white text-brand-700 shadow-card active:scale-[.985]',
}

export function Button({
  children, variant = 'primary', className = '', ...rest
}: { children: ReactNode; variant?: BtnVariant } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`w-full rounded-2xl py-3.5 font-bold text-[15px] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none ${btnStyles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={`bg-white rounded-3xl p-4 ring-1 ring-slate-900/5 shadow-card ${className}`}>
      {children}
    </div>
  )
}

const badgeTones: Record<string, string> = {
  red: 'bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100',
  green: 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100',
  blue: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
}
export function Badge({ tone = 'blue', children, className = '' }: { tone?: keyof typeof badgeTones; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${badgeTones[tone]} ${className}`}>{children}</span>
}

export function Progress({ value, tone }: { value: number; tone?: string }) {
  return (
    <div className="h-2.5 rounded-full bg-slate-200/70 overflow-hidden ring-1 ring-inset ring-slate-900/5">
      <div
        className={`h-full rounded-full transition-all duration-500 ${tone ?? 'bg-gradient-to-r from-brand-500 to-brand-400'}`}
        style={{ width: `${Math.max(value, value > 0 ? 6 : 0)}%` }}
      />
    </div>
  )
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 mt-6 mb-2.5">
      <h2 className="text-[17px] font-extrabold text-ink-900 tracking-tight">{children}</h2>
      {action}
    </div>
  )
}

export function TopBar({ title, back, right }: { title: ReactNode; back?: boolean | string; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <div className="sticky top-0 z-20 glass border-b border-slate-900/5 px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        {back && (
          <button onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))} className="-ml-1 p-1.5 rounded-full active:bg-slate-200/70 transition">
            <ChevronLeft className="w-6 h-6 text-ink-700" />
          </button>
        )}
        <div className="font-bold text-ink-900 truncate">{title}</div>
      </div>
      <div className="flex items-center gap-1 text-slate-500">{right}</div>
    </div>
  )
}

export function Avatar({ initials, className = '' }: { initials: string; className?: string }) {
  return (
    <div className={`rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white grid place-items-center font-bold ring-2 ring-white shadow-brand ${className || 'w-10 h-10'}`}>
      {initials}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block px-5 mb-3">
      <span className="block text-[13px] font-semibold text-ink-500 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'w-full px-4 py-3 rounded-2xl ring-1 ring-inset ring-slate-200 bg-white text-[14px] outline-none focus:ring-2 focus:ring-brand-400 transition placeholder:text-slate-400'

export function Banner({ gradient, emoji, h = 'h-40' }: { gradient: string; emoji: string; h?: string }) {
  return (
    <div className={`relative ${h} bg-gradient-to-br ${gradient} overflow-hidden grid place-items-center`}>
      {/* lớp hoạ tiết mềm tạo chiều sâu */}
      <div className="absolute -right-6 -top-8 w-32 h-32 rounded-full bg-white/15" />
      <div className="absolute -left-8 -bottom-10 w-40 h-40 rounded-full bg-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
      <span className="text-6xl drop-shadow-lg relative">{emoji}</span>
    </div>
  )
}
