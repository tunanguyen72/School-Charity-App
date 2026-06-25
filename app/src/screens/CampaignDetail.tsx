import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Share2, Heart, BadgeCheck, Clock, ShieldCheck, Image as ImageIcon } from 'lucide-react'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { vnd, vndShort, pct } from '../format'
import { Badge, Button, TopBar, Loading, ErrorBox } from '../ui'

type Tab = 'story' | 'donate' | 'cost'

export default function CampaignDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: c, loading, error } = useFetch(() => api.campaign(id!), [id])
  const [tab, setTab] = useState<Tab>('story')

  if (loading) return <div className="min-h-[100svh] bg-slate-50"><TopBar title="Chi tiết chiến dịch" back="/campaigns" /><Loading /></div>
  if (error || !c) return <div className="min-h-[100svh] bg-slate-50"><TopBar title="Chi tiết chiến dịch" back="/campaigns" /><ErrorBox message={error ?? 'Không tìm thấy'} /></div>

  return (
    <div className="min-h-[100svh] bg-slate-50">
      <TopBar title="Chi tiết chiến dịch" back="/campaigns" right={<><Heart className="w-5 h-5" /><Share2 className="w-5 h-5" /></>} />

      <div className={`relative h-44 bg-gradient-to-br ${c.gradient} grid place-items-center`}>
        <span className="text-7xl drop-shadow-lg">{c.emoji}</span>
      </div>

      <div className="px-5 pt-4">
        <Badge tone={c.status === 'urgent' ? 'red' : c.status === 'done' ? 'green' : 'blue'}>
          {c.status === 'urgent' ? '🔴 Khẩn cấp' : c.status === 'done' ? '✅ Hoàn thành' : 'Đang gây quỹ'}
        </Badge>
        <h1 className="text-xl font-extrabold text-slate-800 mt-2 leading-snug">{c.title}</h1>
        <div className="text-slate-400 text-sm mt-1">📍 {c.location}</div>
      </div>

      <div className="mx-5 mt-4 rounded-3xl p-5 text-white bg-gradient-to-br from-brand-600 to-brand-800 shadow-xl shadow-brand-700/30">
        <div className="text-[26px] font-extrabold">{vnd(c.raised)}<span className="text-sm font-medium text-white/70"> / {vndShort(c.goal)}</span></div>
        <div className="h-2 bg-white/25 rounded-full mt-2 overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${pct(c.raised, c.goal)}%` }} /></div>
        <div className="flex justify-between text-[12px] text-white/85 mt-2"><span>{c.donors} nhà hảo tâm</span><span>{c.daysLeft > 0 ? `${c.daysLeft} ngày còn lại` : 'Đã kết thúc'}</span></div>
        {c.status !== 'done' && <Button variant="white" className="mt-3" onClick={() => nav(`/donate/${c.id}`)}><Heart className="w-4 h-4" /> Quyên góp ngay</Button>}
      </div>

      <div className="flex justify-around mt-4 px-5 text-[11px] text-slate-500 text-center">
        <div className="flex flex-col items-center gap-1"><BadgeCheck className="w-5 h-5 text-emerald-500" />Đã xác thực</div>
        <div className="flex flex-col items-center gap-1"><Clock className="w-5 h-5 text-brand-500" />Cập nhật 2h</div>
        <div className="flex flex-col items-center gap-1"><ShieldCheck className="w-5 h-5 text-emerald-500" />Minh bạch 100%</div>
      </div>

      <div className="mx-5 mt-4 grid grid-cols-3 bg-slate-200/70 rounded-2xl p-1">
        {([['story', 'Câu chuyện'], ['donate', 'Quyên góp'], ['cost', 'Chi phí']] as [Tab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`py-2 rounded-xl text-[13px] font-bold transition ${tab === k ? 'bg-white text-brand-700 shadow' : 'text-slate-500'}`}>{l}</button>
        ))}
      </div>

      <div className="px-5 mt-4 pb-6">
        {tab === 'story' && (
          <>
            <p className="text-slate-600 text-sm leading-relaxed">{c.story}</p>
            <h3 className="font-extrabold text-slate-800 mt-5 mb-3">Lộ trình triển khai</h3>
            <div className="space-y-1">
              {c.roadmap.map((r, i) => (
                <div key={i} className="flex gap-3 pb-4 relative">
                  {i < c.roadmap.length - 1 && <span className="absolute left-[10px] top-5 bottom-0 w-0.5 bg-slate-200" />}
                  <span className={`mt-0.5 w-5 h-5 rounded-full border-2 border-white shrink-0 z-10 ring-2 ${r.state === 'done' ? 'bg-emerald-500 ring-emerald-500' : r.state === 'now' ? 'bg-brand-600 ring-brand-600' : 'bg-white ring-slate-300'}`} />
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{r.label}</div>
                    <div className="text-xs text-slate-400">{r.date} · {r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="font-extrabold text-slate-800 mt-3 mb-3">Hình ảnh thực tế</h3>
            {c.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {c.photos.map((p, i) => <img key={i} src={p} alt="Ảnh thực tế" className="h-28 w-full object-cover rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-24 rounded-2xl bg-slate-200 grid place-items-center text-slate-300"><ImageIcon className="w-7 h-7" /></div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'donate' && (
          <div className="space-y-2">
            {c.topDonors.length === 0 && <p className="text-slate-400 text-sm text-center py-6">Chưa có dữ liệu quyên góp.</p>}
            {c.topDonors.map((d, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-3">
                <span className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 grid place-items-center font-bold text-xs">{d.anon ? '🙈' : d.name.split(' ').slice(-1)[0][0]}</span>
                <div className="flex-1 text-sm"><b>{d.anon ? 'Nhà hảo tâm ẩn danh' : d.name}</b><div className="text-xs text-slate-400">{d.when}</div></div>
                <b className="text-emerald-600">+{vndShort(d.amount)}</b>
              </div>
            ))}
          </div>
        )}

        {tab === 'cost' && (
          <div className="space-y-2">
            <div className="text-[12px] text-brand-700 bg-brand-50 rounded-xl px-3 py-2 mb-1">Mỗi khoản chi đều có chứng từ & được xác minh.</div>
            {c.costs.length === 0 && <p className="text-slate-400 text-sm text-center py-6">Chưa phát sinh chi phí.</p>}
            {c.costs.map((x, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-3">
                {x.receipt ? (
                  <img src={x.receipt} alt="Chứng từ" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                ) : (
                  <span className="w-10 h-10 rounded-xl bg-rose-100 grid place-items-center text-lg shrink-0">{x.icon}</span>
                )}
                <div className="flex-1 text-sm min-w-0"><b className="truncate block">{x.label}</b><div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" /> Đã xác minh{x.receipt ? ' · có ảnh chứng từ' : ''}</div></div>
                <b className="text-rose-600 shrink-0">-{vndShort(x.amount)}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
