import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, HandHeart, ReceiptText, Package } from 'lucide-react'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { vnd, vndShort, pct } from '../format'
import { Badge, Card, Progress, TopBar, Loading, ErrorBox } from '../ui'

const filters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'donation', label: 'Quyên góp' },
  { key: 'expense', label: 'Giải ngân' },
  { key: 'inkind', label: 'Hiện vật' },
]

const icon = (k: string) =>
  k === 'donation' ? { el: <HandHeart className="w-5 h-5" />, cls: 'bg-emerald-100 text-emerald-600' }
  : k === 'expense' ? { el: <ReceiptText className="w-5 h-5" />, cls: 'bg-rose-100 text-rose-600' }
  : { el: <Package className="w-5 h-5" />, cls: 'bg-brand-100 text-brand-600' }

export default function Transactions() {
  const nav = useNavigate()
  const [f, setF] = useState('all')
  const { data: ledger, loading, error } = useFetch(() => api.ledger(), [])
  const { data: summary } = useFetch(() => api.summary(), [])
  const list = ledger?.filter((t) => f === 'all' || t.kind === f) ?? []

  const totalRaised = Number(summary?.totalRaised ?? 0)
  const disbursed = Number(summary?.disbursed ?? 0)

  return (
    <div className="min-h-[100svh] app-canvas">
      <TopBar title="Sổ quỹ & Giao dịch" right={<BarChart3 className="w-5 h-5" />} />

      <Card className="mx-4 mt-4">
        <div className="text-sm text-ink-400">Tổng thu quỹ</div>
        <div className="text-2xl font-extrabold text-brand-700">{vnd(totalRaised)}</div>
        <div className="mt-2"><Progress value={totalRaised ? pct(disbursed, totalRaised) : 0} /></div>
        <div className="flex justify-between text-[12px] text-ink-400 mt-1.5">
          <span>Đã giải ngân {vndShort(disbursed)} ({totalRaised ? pct(disbursed, totalRaised) : 0}%)</span>
          <span>Còn {vndShort(Math.max(0, totalRaised - disbursed))}</span>
        </div>
      </Card>

      <div className="flex gap-2 px-4 mt-3 overflow-x-auto no-scrollbar">
        {filters.map((x) => (
          <button key={x.key} onClick={() => setF(x.key)} className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold border transition ${f === x.key ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-ink-500 border-slate-200'}`}>{x.label}</button>
        ))}
      </div>

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      <div className="px-4 mt-3 space-y-2 pb-4">
        {list.map((t) => {
          const ic = icon(t.kind)
          const amt = Number(t.amount)
          return (
            <Card key={t.code} className="!p-3 flex items-center gap-3" onClick={() => nav(`/transaction/${t.code}`)}>
              <span className={`w-10 h-10 rounded-xl grid place-items-center ${ic.cls}`}>{ic.el}</span>
              <div className="flex-1 min-w-0"><b className="text-ink-900">{t.who}</b><div className="text-xs text-ink-400 truncate">{t.code}</div></div>
              <div className="text-right">
                {t.kind === 'inkind'
                  ? <b className="text-ink-700 text-[13px]">{t.label}</b>
                  : <b className={amt < 0 ? 'text-rose-600' : 'text-emerald-600'}>{amt < 0 ? '-' : '+'}{vnd(Math.abs(amt))}</b>}
                <div className="mt-0.5"><Badge tone={t.status === 'verified' ? 'blue' : 'green'} className="!text-[9px] !px-1.5 !py-0.5">{t.status === 'verified' ? 'ĐÃ XÁC MINH' : t.status === 'success' ? 'THÀNH CÔNG' : t.status.toUpperCase()}</Badge></div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
