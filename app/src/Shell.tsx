import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, Heart, Package, ScrollText, CreditCard, User, LayoutDashboard, Signal, Wifi, BatteryFull } from 'lucide-react'
import { useApp } from './store'
import type { Role } from './data'
import type { ComponentType } from 'react'

interface NavItem { icon: ComponentType<{ className?: string }>; label: string; path: string; fab?: boolean }

const navs: Record<Role, NavItem[]> = {
  donor: [
    { icon: Home, label: 'Trang chủ', path: '/home' },
    { icon: LayoutGrid, label: 'Chiến dịch', path: '/campaigns' },
    { icon: Heart, label: 'Quyên góp', path: '/campaign/ban-mo', fab: true },
    { icon: ScrollText, label: 'Hoạt động', path: '/transactions' },
    { icon: User, label: 'Cá nhân', path: '/profile' },
  ],
  tnv: [
    { icon: Home, label: 'Trang chủ', path: '/home' },
    { icon: LayoutGrid, label: 'Chiến dịch', path: '/campaigns' },
    { icon: Package, label: 'Kho', path: '/inventory', fab: true },
    { icon: ScrollText, label: 'Giao dịch', path: '/transactions' },
    { icon: User, label: 'Cá nhân', path: '/profile' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/home' },
    { icon: LayoutGrid, label: 'Chiến dịch', path: '/campaigns' },
    { icon: Package, label: 'Kho', path: '/inventory', fab: true },
    { icon: CreditCard, label: 'Sổ quỹ', path: '/transactions' },
    { icon: User, label: 'Cá nhân', path: '/profile' },
  ],
}

const noNav = ['/', '/qr', '/pay', '/success', '/inventory/receive']
const isNoNav = (p: string) =>
  noNav.includes(p) || p.startsWith('/donate') || p.startsWith('/inventory/distribute') || p.startsWith('/transaction/')

const roleLabels: Record<Role, string> = { donor: 'Nhà hảo tâm', tnv: 'Tình nguyện viên', admin: 'Admin' }

function StatusBar() {
  return (
    <div className="relative shrink-0 h-11 bg-white flex items-end justify-between px-6 pb-1.5 z-40">
      <span className="text-[13px] font-bold text-slate-900">9:41</span>
      <span className="flex items-center gap-1.5 text-slate-900">
        <Signal className="w-[15px] h-[15px]" />
        <Wifi className="w-[15px] h-[15px]" />
        <BatteryFull className="w-[22px] h-[22px]" />
      </span>
    </div>
  )
}

function BottomNav() {
  const { role } = useApp()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const items = navs[role]
  const active = (p: string) => {
    if (p === '/home') return pathname === '/home'
    if (p === '/campaigns') return pathname === '/campaigns'
    if (p.startsWith('/campaign/')) return pathname.startsWith('/campaign/') || pathname.startsWith('/donate')
    if (p === '/inventory') return pathname.startsWith('/inventory')
    if (p === '/transactions') return pathname.startsWith('/transaction')
    return pathname === p
  }

  return (
    <nav className="absolute bottom-0 inset-x-0 h-[70px] bg-white border-t border-slate-100 flex items-center justify-around px-1 z-30">
      {items.map((it) => {
        const Icon = it.icon
        const on = active(it.path) || it.path === pathname
        if (it.fab)
          return (
            <button key={it.label} onClick={() => nav(it.path)} className="flex flex-col items-center flex-1 -mt-7">
              <span className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-xl shadow-brand-600/40">
                <Icon className="w-6 h-6" />
              </span>
              <span className="text-[10px] mt-0.5 font-semibold text-brand-700">{it.label}</span>
            </button>
          )
        return (
          <button key={it.label} onClick={() => nav(it.path)} className={`flex flex-col items-center gap-1 flex-1 text-[10px] font-semibold transition ${on ? 'text-brand-700' : 'text-slate-400'}`}>
            <Icon className="w-[22px] h-[22px]" />
            {it.label}
          </button>
        )
      })}
    </nav>
  )
}

export default function Shell() {
  const { user, role, quickLogin } = useApp()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const hideNav = isNoNav(pathname)

  // Chốt chặn điều hướng theo trạng thái đăng nhập
  const redirect = !user && pathname !== '/' ? '/' : user && pathname === '/' ? '/home' : null

  const switchRole = async (r: Role) => {
    await quickLogin(r)
    nav(r === 'tnv' ? '/inventory' : '/home')
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-6 px-3 bg-[radial-gradient(ellipse_at_top,#1e2a52,#0b1220)]">
      {/* Prototype controls — role switcher (not part of the app UI) */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-5 text-slate-300">
        <span className="font-bold text-white text-sm">🎒 Cùng em đến trường</span>
        <span className="text-xs opacity-60 hidden sm:inline">Đổi vai trò để xem điều hướng khác nhau →</span>
        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
          {(['donor', 'tnv', 'admin'] as Role[]).map((r) => (
            <button key={r} onClick={() => switchRole(r)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${role === r ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              {roleLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Phone */}
      <div className="relative w-[400px] max-w-[96vw] h-[820px] max-h-[86vh] bg-slate-50 rounded-[44px] border-[11px] border-slate-900 shadow-[0_30px_70px_-20px_rgba(0,0,0,.7)] overflow-hidden flex flex-col ring-1 ring-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[26px] bg-slate-900 rounded-b-2xl z-50" />
        {pathname !== '/pay' && <StatusBar />}
        <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: hideNav ? 0 : 78 }}>
          {redirect ? <Navigate to={redirect} replace /> : <Outlet />}
        </div>
        {!hideNav && !redirect && <BottomNav />}
      </div>
    </div>
  )
}
