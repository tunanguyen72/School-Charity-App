import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, Heart, Package, ScrollText, User, LayoutDashboard, HandCoins, Users } from 'lucide-react'
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
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: LayoutGrid, label: 'Chiến dịch', path: '/admin/campaigns' },
    { icon: HandCoins, label: 'Giải ngân', path: '/admin/disbursement' },
    { icon: Users, label: 'Người dùng', path: '/admin/users' },
    { icon: User, label: 'Cá nhân', path: '/profile' },
  ],
}

const noNav = ['/', '/qr', '/pay', '/success', '/inventory/receive']
const isNoNav = (p: string) =>
  noNav.includes(p) || p.startsWith('/donate') || p.startsWith('/inventory/distribute') || p.startsWith('/transaction/')

function BottomNav() {
  const { role } = useApp()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const items = navs[role]
  const active = (p: string) => {
    if (p === '/home') return pathname === '/home'
    if (p === '/admin') return pathname === '/admin'
    if (p === '/admin/campaigns') return pathname.startsWith('/admin/campaigns')
    if (p === '/admin/disbursement') return pathname === '/admin/disbursement'
    if (p === '/admin/users') return pathname === '/admin/users'
    if (p === '/campaigns') return pathname === '/campaigns'
    if (p.startsWith('/campaign/')) return pathname.startsWith('/campaign/') || pathname.startsWith('/donate')
    if (p === '/inventory') return pathname.startsWith('/inventory')
    if (p === '/transactions') return pathname.startsWith('/transaction')
    return pathname === p
  }

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-slate-100 flex items-center justify-around px-1 z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="absolute inset-0 -z-10 bg-white" />
      <div className="w-full flex items-center justify-around h-[68px]">
        {items.map((it) => {
          const Icon = it.icon
          const on = active(it.path)
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
      </div>
    </nav>
  )
}

export default function Shell() {
  const { user } = useApp()
  const { pathname } = useLocation()
  const hideNav = isNoNav(pathname)

  // Chốt chặn điều hướng theo trạng thái đăng nhập (admin vào thẳng khu quản trị)
  const landing = user?.role === 'admin' ? '/admin' : '/home'
  const redirect = !user && pathname !== '/' ? '/' : user && pathname === '/' ? landing : null

  return (
    <div className="min-h-screen w-full bg-slate-50 flex justify-center">
      <div
        className="relative w-full max-w-[480px] min-h-screen bg-slate-50 overflow-x-hidden sm:shadow-2xl sm:shadow-black/5"
        style={{ paddingBottom: hideNav ? 0 : 'calc(72px + env(safe-area-inset-bottom))' }}
      >
        {redirect ? <Navigate to={redirect} replace /> : <Outlet />}
        {!hideNav && !redirect && <BottomNav />}
      </div>
    </div>
  )
}
