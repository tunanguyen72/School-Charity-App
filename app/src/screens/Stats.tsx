import type { ReactNode } from 'react'
import { TrendingUp, Wallet, HandCoins, Users, Building2, Baby, Package, Receipt } from 'lucide-react'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { vnd, vndShort, pct } from '../format'
import { Card, TopBar, Loading, ErrorBox, Badge } from '../ui'
import { BarChart, DonutChart, FlowBar, CHART_COLORS } from '../charts'

function Kpi({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone: string }) {
  return (
    <Card className="!p-3.5">
      <span className={`w-8 h-8 rounded-xl grid place-items-center mb-2 ${tone}`}>{icon}</span>
      <div className="text-[17px] font-extrabold text-slate-800 leading-none">{value}</div>
      <div className="text-[11px] text-slate-400 mt-1">{label}</div>
    </Card>
  )
}

export default function Stats() {
  const { data, loading, error } = useFetch(() => api.stats(), [])

  if (loading) return <div className="min-h-full bg-slate-50"><TopBar title="Báo cáo minh bạch" back /><Loading /></div>
  if (error || !data) return <div className="min-h-full bg-slate-50"><TopBar title="Báo cáo minh bạch" back /><ErrorBox message={error ?? 'Lỗi'} /></div>

  const o = data.overview
  const monthTotal = data.monthly.reduce((s, m) => s + m.total, 0)

  return (
    <div className="min-h-full bg-slate-50 pb-6">
      <TopBar title="Báo cáo minh bạch" back right={<Badge tone="green">🛡️ 100%</Badge>} />

      {/* Hero tổng quỹ */}
      <div className="mx-4 mt-4 rounded-3xl p-5 text-white bg-gradient-to-br from-brand-600 to-brand-900 shadow-xl shadow-brand-700/30">
        <div className="text-[13px] text-white/80">Tổng quỹ đã nhận</div>
        <div className="text-[32px] font-extrabold leading-none mt-1">{vnd(o.totalRaised)}</div>
        <div className="flex gap-4 mt-3 text-[12px] text-white/85">
          <span>🔴 Đã chi <b className="text-white">{vndShort(o.totalDisbursed)}</b></span>
          <span>🟢 Số dư <b className="text-white">{vndShort(o.balance)}</b></span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        <Kpi icon={<HandCoins className="w-4 h-4 text-emerald-600" />} tone="bg-emerald-100" label="Lượt quyên góp" value={`${o.donationCount}`} />
        <Kpi icon={<Users className="w-4 h-4 text-brand-600" />} tone="bg-brand-100" label="Nhà hảo tâm" value={`${o.donorCount}`} />
        <Kpi icon={<Wallet className="w-4 h-4 text-violet-600" />} tone="bg-violet-100" label="TB mỗi lượt" value={vndShort(o.avgDonation)} />
        <Kpi icon={<TrendingUp className="w-4 h-4 text-rose-600" />} tone="bg-rose-100" label="Tỉ lệ giải ngân" value={`${o.disbursementRate}%`} />
        <Kpi icon={<Baby className="w-4 h-4 text-amber-600" />} tone="bg-amber-100" label="Trẻ được hỗ trợ" value={`${o.childrenHelped.toLocaleString('vi-VN')}`} />
        <Kpi icon={<Building2 className="w-4 h-4 text-teal-600" />} tone="bg-teal-100" label="Điểm trường" value={`${o.schools}`} />
        <Kpi icon={<Package className="w-4 h-4 text-cyan-600" />} tone="bg-cyan-100" label="Hiện vật đã trao" value={`${o.inkindGiven}/${o.inkindTotal}`} />
        <Kpi icon={<Receipt className="w-4 h-4 text-slate-600" />} tone="bg-slate-100" label="Chiến dịch" value={`${o.campaignsActive}+${o.campaignsDone}`} />
      </div>

      {/* Biểu đồ theo tháng */}
      <Card className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-extrabold text-slate-800">Quyên góp theo tháng</h2>
          <span className="text-[12px] text-slate-400">2024 · {vndShort(monthTotal)}</span>
        </div>
        <BarChart data={data.monthly} />
      </Card>

      {/* Phân bổ quỹ */}
      <Card className="mx-4 mt-4">
        <h2 className="font-extrabold text-slate-800 mb-3">Phân bổ quỹ theo chiến dịch</h2>
        <DonutChart
          data={data.byCampaign.map((c) => ({ label: c.title, value: c.raised }))}
          centerLabel="Tổng quỹ" centerValue={vndShort(o.totalRaised)}
        />
      </Card>

      {/* Thu - chi */}
      <Card className="mx-4 mt-4">
        <h2 className="font-extrabold text-slate-800 mb-3">Dòng tiền: Thu — Chi</h2>
        <FlowBar raised={o.totalRaised} disbursed={o.totalDisbursed} />
      </Card>

      {/* Tiến độ chiến dịch */}
      <Card className="mx-4 mt-4">
        <h2 className="font-extrabold text-slate-800 mb-3">Tiến độ từng chiến dịch</h2>
        <div className="space-y-3">
          {data.byCampaign.map((c, i) => (
            <div key={c.slug}>
              <div className="flex items-center justify-between text-[13px] mb-1">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold truncate"><span>{c.emoji}</span>{c.title}</span>
                <span className="text-slate-400 shrink-0">{pct(c.raised, c.goal)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct(c.raised, c.goal)}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>{vndShort(c.raised)} / {vndShort(c.goal)}</span><span>{c.donors} người</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top nhà hảo tâm */}
      <Card className="mx-4 mt-4">
        <h2 className="font-extrabold text-slate-800 mb-3">Top nhà hảo tâm 🏆</h2>
        <div className="space-y-2">
          {data.topDonors.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-7 h-7 rounded-full grid place-items-center text-xs font-extrabold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
              <div className="flex-1 min-w-0"><b className="text-slate-800 text-sm truncate block">{d.name}</b><span className="text-[11px] text-slate-400">{d.count} lượt</span></div>
              <b className="text-emerald-600">{vndShort(d.total)}</b>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-center text-[11px] text-slate-400 mt-5 px-8">Số liệu được tổng hợp tự động từ giao dịch & chứng từ đã xác minh trong hệ thống.</p>
    </div>
  )
}
