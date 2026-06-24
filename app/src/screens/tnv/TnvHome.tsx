import { useNavigate } from 'react-router-dom'
import { PackagePlus, Send, Receipt, MapPin, Bell, ArrowRight } from 'lucide-react'
import { useApp } from '../../store'
import { api } from '../../api'
import { useFetch } from '../../useFetch'
import { vndShort } from '../../format'
import { Avatar, Card, SectionTitle } from '../../ui'

const actions = [
  { icon: PackagePlus, label: 'Nhận hiện vật', to: '/inventory/receive', tone: 'bg-emerald-100 text-emerald-600' },
  { icon: Send, label: 'Phân phối', to: '/inventory', tone: 'bg-brand-100 text-brand-600' },
  { icon: Receipt, label: 'Ghi chi phí', to: '/field-expense', tone: 'bg-amber-100 text-amber-700' },
  { icon: MapPin, label: 'Điểm trường', to: '/beneficiaries', tone: 'bg-violet-100 text-violet-600' },
]

export default function TnvHome() {
  const nav = useNavigate()
  const { user } = useApp()
  const { data: f } = useFetch(() => api.myField(), [])

  return (
    <div className="min-h-[100svh] bg-slate-50 pb-4">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={user?.fullName?.split(' ').slice(-1)[0][0] ?? 'T'} />
          <div>
            <div className="font-extrabold text-slate-800 leading-tight">Chào {user?.fullName ?? 'bạn'}!</div>
            <div className="text-xs text-slate-400">Tình nguyện viên hiện trường</div>
          </div>
        </div>
        <button onClick={() => nav('/notifications')} className="relative p-2 rounded-full active:bg-slate-200"><Bell className="w-5 h-5 text-slate-600" /></button>
      </div>

      {/* Field stats */}
      <div className="mx-4 rounded-3xl p-5 text-white bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xl shadow-emerald-700/30">
        <div className="text-[13px] text-white/80">Hoạt động hiện trường của tôi</div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[[`${f?.batchesReceived ?? 0}`, 'LÔ ĐÃ NHẬN'], [`${f?.itemsGiven ?? 0}`, 'ĐÃ TRAO'], [`${f?.distributionCount ?? 0}`, 'LẦN PHÂN PHỐI']].map(([a, b]) => (
            <div key={b} className="text-center bg-white/10 rounded-2xl py-3"><div className="font-extrabold text-[17px]">{a}</div><div className="text-[10px] text-white/75">{b}</div></div>
          ))}
        </div>
        <div className="flex justify-between text-[12px] text-white/85 mt-3">
          <span>🧾 Chi phí chờ duyệt: <b className="text-white">{f?.expensePending ?? 0}</b></span>
          <span>✅ Đã duyệt: <b className="text-white">{vndShort(f?.expenseVerified ?? 0)}</b></span>
        </div>
      </div>

      <SectionTitle>Thao tác nhanh</SectionTitle>
      <div className="grid grid-cols-2 gap-3 px-4">
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <Card key={a.label} className="!p-4 flex flex-col items-start gap-2" onClick={() => nav(a.to)}>
              <span className={`w-11 h-11 rounded-2xl grid place-items-center ${a.tone}`}><Icon className="w-5 h-5" /></span>
              <div className="font-bold text-slate-800 text-sm">{a.label}</div>
            </Card>
          )
        })}
      </div>

      <SectionTitle>Lần trao tặng gần đây</SectionTitle>
      <div className="mx-4 space-y-2">
        {f?.recent.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Chưa có lần phân phối nào. Bắt đầu từ Kho hiện vật.</p>}
        {f?.recent.map((r) => (
          <Card key={r.id} className="!p-3 flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 grid place-items-center text-lg">📦</span>
            <div className="flex-1 text-sm"><b>{r.qty} {r.unit} {r.item}</b><div className="text-xs text-slate-400">→ {r.to}</div></div>
            <span className="text-[11px] text-slate-400">{new Date(r.at).toLocaleDateString('vi-VN')}</span>
          </Card>
        ))}
        <button onClick={() => nav('/inventory')} className="w-full flex items-center justify-center gap-1.5 text-brand-600 text-sm font-semibold py-2">Xem kho hiện vật <ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
