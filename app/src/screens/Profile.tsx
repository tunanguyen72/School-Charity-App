import { useNavigate } from 'react-router-dom'
import { Bell, ScrollText, FileText, BarChart3, LogOut, ChevronRight } from 'lucide-react'
import { useApp } from '../store'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { vnd } from '../format'
import { Avatar, Card, TopBar } from '../ui'

const roleLabel: Record<string, string> = { donor: 'Nhà hảo tâm', tnv: 'Tình nguyện viên', admin: 'Admin / Điều phối' }

const menu = [
  { icon: ScrollText, label: 'Lịch sử quyên góp', to: '/transactions' },
  { icon: FileText, label: 'Biên nhận điện tử', to: '/transactions' },
  { icon: BarChart3, label: 'Báo cáo minh bạch', to: '/stats' },
]

export default function Profile() {
  const nav = useNavigate()
  const { user, logout } = useApp()
  const { data: stats } = useFetch(() => api.myStats(), [user?.id])

  const doLogout = () => { logout(); nav('/') }

  return (
    <div className="min-h-[100svh] bg-slate-50 pb-4">
      <TopBar title="Hồ sơ cá nhân" right={<button onClick={() => nav('/notifications')}><Bell className="w-5 h-5" /></button>} />

      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 flex items-center gap-3">
        <Avatar initials={user?.fullName?.split(' ').slice(-1)[0][0] ?? 'U'} className="w-14 h-14 text-lg" />
        <div><div className="font-extrabold text-slate-800 text-lg">{user?.fullName ?? 'Người dùng'}</div><div className="text-slate-400 text-sm">{roleLabel[user?.role ?? 'donor']}</div></div>
      </div>

      <div className="mx-4 mt-4 rounded-3xl p-5 text-white bg-gradient-to-br from-brand-500 to-brand-800 shadow-xl shadow-brand-700/30">
        <div className="text-[13px] text-white/80">Tổng giá trị đóng góp</div>
        <div className="text-[32px] font-extrabold leading-none mt-1">{vnd(Number(stats?.totalDonated ?? 0))}</div>
        <div className="grid grid-cols-2 gap-2 mt-4 bg-white/10 rounded-2xl p-3">
          <div className="text-center"><div className="font-extrabold text-[15px]">{stats?.donationCount ?? 0}</div><div className="text-[10px] text-white/75">LẦN ĐÓNG GÓP</div></div>
          <div className="text-center"><div className="font-extrabold text-[15px]">{stats?.projectCount ?? 0}</div><div className="text-[10px] text-white/75">DỰ ÁN HỖ TRỢ</div></div>
        </div>
      </div>

      <h2 className="text-base font-extrabold text-slate-800 px-5 mt-5 mb-2">Thành tựu & Tác động</h2>
      <div className="grid grid-cols-2 gap-3 px-4">
        <Card className="text-center !py-4"><div className="text-3xl">🎒</div><div className="font-bold text-sm mt-1">20 trẻ</div><div className="text-[11px] text-slate-400">được hỗ trợ sách vở</div></Card>
        <Card className="text-center !py-4"><div className="text-3xl">🏅</div><div className="font-bold text-sm mt-1">Người đồng hành</div><div className="text-[11px] text-slate-400">huy hiệu mốc</div></Card>
      </div>

      <h2 className="text-base font-extrabold text-slate-800 px-5 mt-5 mb-2">Tài khoản</h2>
      <div className="mx-4 bg-white rounded-2xl overflow-hidden">
        {menu.map((m, i) => {
          const Icon = m.icon
          return (
            <button key={i} onClick={() => nav(m.to)} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 last:border-0 active:bg-slate-50">
              <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 grid place-items-center"><Icon className="w-[18px] h-[18px]" /></span>
              <span className="flex-1 text-left text-sm font-medium text-slate-700">{m.label}</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          )
        })}
      </div>

      <div className="mx-4 mt-3">
        <button onClick={doLogout} className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl active:bg-rose-50">
          <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 grid place-items-center"><LogOut className="w-[18px] h-[18px]" /></span>
          <span className="flex-1 text-left text-sm font-bold text-rose-600">Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}
