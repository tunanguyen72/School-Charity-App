import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { vnd, vndShort, pct } from '../format'
import { Badge, Button, Card, Progress, TopBar, Loading, ErrorBox, inputCls } from '../ui'

const filters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'urgent', label: 'Khẩn cấp' },
  { key: 'active', label: 'Đang gây quỹ' },
  { key: 'done', label: 'Hoàn thành' },
]

const statusBadge: Record<string, { tone: 'red' | 'blue' | 'green'; label: string }> = {
  urgent: { tone: 'red', label: '🔴 Khẩn cấp' },
  active: { tone: 'blue', label: 'Đang gây quỹ' },
  done: { tone: 'green', label: '✅ Hoàn thành' },
}

export default function Campaigns() {
  const nav = useNavigate()
  const [f, setF] = useState('all')
  const { data: list, loading, error } = useFetch(() => api.campaigns(f), [f])

  return (
    <div className="min-h-[100svh] bg-slate-50">
      <TopBar title="Chiến dịch" right={<Bell className="w-5 h-5" />} />
      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input className={inputCls + ' pl-11'} placeholder="Tìm kiếm chiến dịch..." />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
          {filters.map((x) => (
            <button key={x.key} onClick={() => setF(x.key)} className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold border transition ${f === x.key ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-500 border-slate-200'}`}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      <div className="px-4 mt-3 space-y-3 pb-4">
        {list?.map((c) => {
          const sb = statusBadge[c.status] ?? statusBadge.active
          const done = c.status === 'done'
          return (
            <Card key={c.id} className="!p-3 overflow-hidden" onClick={() => nav(`/campaign/${c.id}`)}>
              <div className={`relative h-32 -m-3 mb-3 bg-gradient-to-br ${c.gradient} grid place-items-center`}>
                <span className="text-5xl">{c.emoji}</span>
                <div className="absolute top-3 left-3"><Badge tone={sb.tone} className={c.status === 'urgent' ? '!bg-rose-500 !text-white' : ''}>{sb.label}</Badge></div>
              </div>
              <div className="font-bold text-slate-800 leading-snug">{c.title}</div>
              <div className="mt-2"><Progress value={pct(c.raised, c.goal)} tone={done ? 'bg-emerald-500' : 'bg-brand-600'} /></div>
              <div className="flex items-center justify-between mt-1.5 text-[13px]">
                <span className={`font-bold ${done ? 'text-emerald-600' : 'text-brand-700'}`}>{vnd(c.raised)}</span>
                <span className="text-slate-400">/ {vndShort(c.goal)} · {pct(c.raised, c.goal)}%</span>
              </div>
              {done ? (
                <Button variant="ghost" className="mt-3">Xem kết quả</Button>
              ) : (
                <Button variant="soft" className="mt-3" onClick={(e) => { e.stopPropagation(); nav(`/donate/${c.id}`) }}>Quyên góp ngay</Button>
              )}
            </Card>
          )
        })}
        {!loading && list?.length === 0 && <p className="text-center text-slate-400 text-sm py-8">Không có chiến dịch nào.</p>}
      </div>
    </div>
  )
}
