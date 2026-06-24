import { useNavigate } from 'react-router-dom'
import { Bell, TrendingUp, ChevronRight, BarChart3 } from 'lucide-react'
import { useApp } from '../store'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { vnd, vndShort, pct } from '../format'
import { Avatar, Badge, Button, Card, Progress, SectionTitle, Loading, ErrorBox } from '../ui'

export default function Home() {
  const nav = useNavigate()
  const { user } = useApp()

  const { data: stats } = useFetch(() => api.stats(), [])
  const { data: campaigns, loading, error } = useFetch(() => api.campaigns(), [])
  const featured = campaigns?.find((c) => c.status === 'urgent') ?? campaigns?.[0]
  const o = stats?.overview

  return (
    <div className="min-h-[100svh] bg-slate-50 pb-4">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={user?.fullName?.split(' ').slice(-1)[0][0] ?? 'U'} />
          <div>
            <div className="font-extrabold text-slate-800 leading-tight">Chào {user?.fullName ?? 'bạn'}!</div>
            <div className="text-xs text-slate-400">Thứ Hai, 22 Tháng 5</div>
          </div>
        </div>
        <button onClick={() => nav('/notifications')} className="relative p-2 rounded-full active:bg-slate-200">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
      </div>

      {/* Hero */}
      <div className="mx-4 rounded-3xl p-5 text-white bg-gradient-to-br from-brand-500 to-brand-800 shadow-xl shadow-brand-700/30 relative overflow-hidden">
        <div className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-white/10" />
        <div className="text-[13px] text-white/80 relative">Tổng quỹ đã nhận</div>
        <div className="text-[34px] font-extrabold tracking-tight leading-none mt-1 relative">{vnd(o?.totalRaised ?? 0)}</div>
        <div className="flex items-center gap-2 mt-1.5 text-[13px] text-white/85 relative">
          + {o?.inkindTotal ?? 0} món hiện vật
          <span className="inline-flex items-center gap-0.5 bg-white/20 px-1.5 py-0.5 rounded-md text-[11px] font-bold"><TrendingUp className="w-3 h-3" /> {o?.disbursementRate ?? 0}% giải ngân</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 bg-white/10 rounded-2xl p-3 relative">
          {[[`${o?.inkindTotal ?? 0}`, 'HIỆN VẬT'], [`${(o?.campaignsActive ?? 0) + (o?.campaignsDone ?? 0)}`, 'DỰ ÁN'], [`${(o?.childrenHelped ?? 0).toLocaleString('vi-VN')}`, 'TRẺ HỖ TRỢ']].map(([a, b]) => (
            <div key={b} className="text-center">
              <div className="font-extrabold text-[15px]">{a}</div>
              <div className="text-[10px] text-white/75">{b}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Báo cáo minh bạch (mọi vai trò) */}
      <button onClick={() => nav('/stats')} className="mx-4 mt-3 w-[calc(100%-2rem)] flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-sm active:bg-slate-50">
        <span className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 grid place-items-center"><BarChart3 className="w-5 h-5" /></span>
        <div className="flex-1 text-left"><div className="font-bold text-sm text-slate-800">Báo cáo minh bạch</div><div className="text-[11px] text-slate-400">Biểu đồ quỹ, phân bổ & top nhà hảo tâm</div></div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </button>

      <SectionTitle action={<button onClick={() => nav('/campaigns')} className="text-brand-600 text-sm font-semibold">Tất cả</button>}>
        Chiến dịch nổi bật
      </SectionTitle>

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}
      {featured && (
        <Card className="mx-4 !p-3 overflow-hidden" onClick={() => nav(`/campaign/${featured.id}`)}>
          <div className={`relative h-36 -m-3 mb-3 bg-gradient-to-br ${featured.gradient} grid place-items-center`}>
            <span className="text-5xl">{featured.emoji}</span>
            {featured.status === 'urgent' && <Badge tone="red" className="absolute top-3 left-3 !bg-rose-500 !text-white">🔴 KHẨN CẤP</Badge>}
          </div>
          <div className="font-bold text-slate-800">{featured.title}</div>
          <p className="text-slate-400 text-[13px] mt-0.5 line-clamp-1">{featured.story}</p>
          <div className="mt-2"><Progress value={pct(featured.raised, featured.goal)} /></div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="font-bold text-brand-700">{vnd(featured.raised)}</span>
            <span className="text-slate-400 text-[13px]">{pct(featured.raised, featured.goal)}% mục tiêu</span>
          </div>
          <Button className="mt-3" onClick={(e) => { e.stopPropagation(); nav(`/donate/${featured.id}`) }}>Quyên góp ngay</Button>
        </Card>
      )}

      <SectionTitle>Hoạt động mới nhất</SectionTitle>
      <div className="mx-4 space-y-2">
        <Card className="!p-3 flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 grid place-items-center text-lg">💝</span>
          <div className="flex-1 text-sm"><b>Công ty TechCloud</b> quyên góp {vndShort(20_000_000)}<div className="text-xs text-slate-400">2 phút trước</div></div>
        </Card>
        <Card className="!p-3 flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-brand-100 text-brand-600 grid place-items-center text-lg">📦</span>
          <div className="flex-1 text-sm">Trao sách tại <b>Hà Giang</b><div className="text-xs text-slate-400">1 giờ trước</div></div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </Card>
      </div>
    </div>
  )
}
