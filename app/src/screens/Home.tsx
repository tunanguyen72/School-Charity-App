import { useNavigate } from 'react-router-dom'
import { Bell, TrendingUp, ChevronRight, BarChart3, HeartHandshake, PackageCheck, Receipt } from 'lucide-react'
import { useApp } from '../store'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { vnd, vndShort, pct, dateLong, timeAgo } from '../format'
import { Avatar, Badge, Button, Card, Progress, SectionTitle, Loading, ErrorBox } from '../ui'
import TnvHome from './tnv/TnvHome'

export default function Home() {
  const { role } = useApp()
  return role === 'tnv' ? <TnvHome /> : <DonorHome />
}

// Ánh xạ 1 dòng sổ quỹ thật -> nội dung hiển thị cho feed hoạt động
function activityView(it: { kind: string; who: string; amount: string; label?: string }) {
  const amt = Number(it.amount)
  if (it.kind === 'donation')
    return { icon: HeartHandshake, tone: 'bg-emerald-100 text-emerald-600', node: <><b>{it.who}</b> quyên góp {vndShort(amt)}</> }
  if (it.kind === 'inkind')
    return { icon: PackageCheck, tone: 'bg-brand-100 text-brand-600', node: <>Nhận hiện vật: <b>{it.label ?? it.who}</b></> }
  return { icon: Receipt, tone: 'bg-amber-100 text-amber-600', node: <>Giải ngân: <b>{it.who}</b> · {vndShort(Math.abs(amt))}</> }
}

function DonorHome() {
  const nav = useNavigate()
  const { user } = useApp()

  const { data: stats } = useFetch(() => api.stats(), [])
  const { data: campaigns, loading, error } = useFetch(() => api.campaigns(), [])
  const { data: ledger } = useFetch(() => api.ledger(), [])
  const featured = campaigns?.find((c) => c.status === 'urgent') ?? campaigns?.[0]
  const o = stats?.overview
  const activity = (ledger ?? []).filter((x) => x.at).slice(0, 4)

  return (
    <div className="min-h-[100svh] app-canvas pb-4">
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={user?.fullName?.split(' ').slice(-1)[0][0] ?? 'U'} />
          <div>
            <div className="font-extrabold text-ink-900 leading-tight">Chào {user?.fullName ?? 'bạn'}! 👋</div>
            <div className="text-xs text-ink-400 capitalize">{dateLong()}</div>
          </div>
        </div>
        <button onClick={() => nav('/notifications')} className="relative p-2.5 rounded-full bg-white ring-1 ring-slate-900/5 shadow-soft active:scale-95 transition">
          <Bell className="w-5 h-5 text-ink-700" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>
      </div>

      {/* Hero — thẻ quỹ cao cấp */}
      <div className="mx-4 rounded-4xl p-5 text-white bg-gradient-to-br from-brand-500 via-brand-700 to-brand-900 shadow-float relative overflow-hidden">
        <div className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/10 blur-[2px]" />
        <div className="absolute -left-10 -bottom-16 w-48 h-48 rounded-full bg-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="text-[12.5px] text-white/75 font-medium uppercase tracking-wide">Tổng quỹ đã nhận</div>
            <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-full text-[11px] font-bold"><TrendingUp className="w-3 h-3" /> {o?.disbursementRate ?? 0}% giải ngân</span>
          </div>
          <div className="text-[36px] font-extrabold tracking-tight leading-none mt-2">{vnd(o?.totalRaised ?? 0)}</div>
          <div className="text-[13px] text-white/80 mt-1.5">+ {o?.inkindTotal ?? 0} món hiện vật đã tiếp nhận</div>
          <div className="grid grid-cols-3 mt-4 bg-white/10 rounded-2xl p-3 ring-1 ring-white/10 divide-x divide-white/10">
            {[[`${o?.inkindTotal ?? 0}`, 'HIỆN VẬT'], [`${(o?.campaignsActive ?? 0) + (o?.campaignsDone ?? 0)}`, 'DỰ ÁN'], [`${(o?.childrenHelped ?? 0).toLocaleString('vi-VN')}`, 'TRẺ HỖ TRỢ']].map(([a, b]) => (
              <div key={b} className="text-center px-1">
                <div className="font-extrabold text-[16px]">{a}</div>
                <div className="text-[9.5px] text-white/70 mt-0.5 tracking-wide">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Báo cáo minh bạch (mọi vai trò) */}
      <button onClick={() => nav('/stats')} className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center gap-3 bg-white rounded-2xl p-3.5 ring-1 ring-slate-900/5 shadow-soft active:scale-[.99] transition">
        <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center ring-1 ring-brand-100"><BarChart3 className="w-5 h-5" /></span>
        <div className="flex-1 text-left"><div className="font-bold text-sm text-ink-900">Báo cáo minh bạch</div><div className="text-[11px] text-ink-400">Biểu đồ quỹ, phân bổ & top nhà hảo tâm</div></div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </button>

      <SectionTitle action={<button onClick={() => nav('/campaigns')} className="text-brand-600 text-sm font-semibold">Tất cả</button>}>
        Chiến dịch nổi bật
      </SectionTitle>

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}
      {featured && (
        <Card className="mx-4 !p-3 overflow-hidden active:scale-[.99] transition" onClick={() => nav(`/campaign/${featured.id}`)}>
          <div className={`relative h-40 -m-3 mb-3 bg-gradient-to-br ${featured.gradient} grid place-items-center overflow-hidden`}>
            <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full bg-white/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            <span className="text-6xl drop-shadow-lg relative">{featured.emoji}</span>
            {featured.status === 'urgent'
              ? <Badge tone="red" className="absolute top-3 left-3 !bg-rose-500 !text-white !ring-0 shadow-lg">🔴 KHẨN CẤP</Badge>
              : <Badge tone="blue" className="absolute top-3 left-3 !bg-white/90 !text-brand-700 !ring-0 shadow">Nổi bật</Badge>}
            <div className="absolute bottom-2.5 left-3 right-3 text-white">
              <div className="font-bold leading-tight drop-shadow line-clamp-1">{featured.title}</div>
            </div>
          </div>
          <p className="text-ink-400 text-[13px] line-clamp-1">{featured.story}</p>
          <div className="mt-2.5"><Progress value={pct(featured.raised, featured.goal)} /></div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-extrabold text-brand-700">{vnd(featured.raised)}</span>
            <span className="text-ink-400 text-[13px] font-semibold">{pct(featured.raised, featured.goal)}% mục tiêu</span>
          </div>
          <Button className="mt-3" onClick={(e) => { e.stopPropagation(); nav(`/donate/${featured.id}`) }}>Quyên góp ngay</Button>
        </Card>
      )}

      <SectionTitle action={activity.length ? <button onClick={() => nav('/stats')} className="text-brand-600 text-sm font-semibold">Xem quỹ</button> : undefined}>
        Hoạt động mới nhất
      </SectionTitle>
      <div className="mx-4 space-y-2">
        {activity.length === 0 && !loading && (
          <Card className="!p-4 text-center text-sm text-ink-400">Chưa có hoạt động nào.</Card>
        )}
        {activity.map((it, i) => {
          const v = activityView(it)
          const Icon = v.icon
          return (
            <Card key={`${it.code}-${i}`} className="!p-3 flex items-center gap-3">
              <span className={`w-10 h-10 rounded-xl grid place-items-center ${v.tone}`}><Icon className="w-5 h-5" /></span>
              <div className="flex-1 text-sm text-ink-700 leading-snug">{v.node}<div className="text-xs text-ink-400 mt-0.5">{timeAgo(it.at)}</div></div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
