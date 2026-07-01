import { useNavigate } from 'react-router-dom'
import { LayoutGrid, HandCoins, Users, ChevronRight, ShieldCheck, BarChart3 } from 'lucide-react'
import { api } from '../../api'
import { useFetch } from '../../useFetch'
import { vndShort } from '../../format'
import { Card, TopBar } from '../../ui'

const sections = [
  { icon: LayoutGrid, label: 'Quản lý chiến dịch', desc: 'Tạo, sửa, xóa chiến dịch', to: '/admin/campaigns', tone: 'bg-brand-100 text-brand-600' },
  { icon: HandCoins, label: 'Giải ngân & chi phí', desc: 'Tạo khoản chi, duyệt chứng từ', to: '/admin/disbursement', tone: 'bg-rose-100 text-rose-600' },
  { icon: Users, label: 'Người dùng & phân quyền', desc: 'Cấp quyền TNV / Admin', to: '/admin/users', tone: 'bg-violet-100 text-violet-600' },
  { icon: BarChart3, label: 'Báo cáo minh bạch', desc: 'Biểu đồ quỹ, phân bổ, top góp', to: '/stats', tone: 'bg-emerald-100 text-emerald-600' },
]

export default function AdminHome() {
  const nav = useNavigate()
  const { data: stats } = useFetch(() => api.stats(), [])
  const o = stats?.overview

  return (
    <div className="min-h-[100svh] app-canvas pb-6">
      <TopBar title="Bảng quản trị" right={<ShieldCheck className="w-5 h-5 text-emerald-500" />} />

      <div className="mx-4 mt-4 rounded-3xl p-5 text-white bg-gradient-to-br from-brand-600 to-brand-900 shadow-float">
        <div className="text-[13px] text-white/80">Tổng quan hệ thống</div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[[`${(o?.campaignsActive ?? 0) + (o?.campaignsDone ?? 0)}`, 'CHIẾN DỊCH'], [vndShort(o?.totalRaised ?? 0), 'TỔNG QUỸ'], [`${o?.donorCount ?? 0}`, 'NGƯỜI GÓP']].map(([a, b]) => (
            <div key={b} className="text-center bg-white/10 rounded-2xl py-3"><div className="font-extrabold text-[15px]">{a}</div><div className="text-[10px] text-white/75">{b}</div></div>
          ))}
        </div>
      </div>

      <h2 className="text-base font-extrabold text-ink-900 px-5 mt-5 mb-2">Chức năng quản trị</h2>
      <div className="px-4 space-y-3">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.to} className="!p-4 flex items-center gap-3" onClick={() => nav(s.to)}>
              <span className={`w-11 h-11 rounded-2xl grid place-items-center ${s.tone}`}><Icon className="w-5 h-5" /></span>
              <div className="flex-1"><div className="font-bold text-ink-900">{s.label}</div><div className="text-[12px] text-ink-400">{s.desc}</div></div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </Card>
          )
        })}
      </div>
    </div>
  )
}
