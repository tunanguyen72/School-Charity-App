import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { pct } from '../format'
import { Badge, Card, Progress, TopBar, Loading, ErrorBox } from '../ui'

const statusMap: Record<string, { tone: 'blue' | 'amber' | 'green'; label: string }> = {
  stored: { tone: 'blue', label: 'Đang lưu kho' },
  partial: { tone: 'amber', label: 'Một phần' },
  given: { tone: 'green', label: 'Đã trao tặng' },
}
const emojiFor = (cat: string) => (cat === 'book' ? '📚' : cat === 'clothing' ? '🧥' : cat === 'supplies' ? '✏️' : '📦')

export default function Inventory() {
  const nav = useNavigate()
  const { data: batches, loading, error } = useFetch(() => api.inventory(), [])

  const total = batches?.reduce((s, b) => s + b.quantityTotal, 0) ?? 0
  const stored = batches?.reduce((s, b) => s + b.quantityRemaining, 0) ?? 0
  const given = total - stored

  return (
    <div className="min-h-full bg-slate-50">
      <TopBar title="Kho hiện vật" right={<button onClick={() => nav('/inventory/receive')} className="p-1.5 rounded-full bg-brand-600 text-white active:scale-95"><Plus className="w-5 h-5" /></button>} />

      <div className="mx-4 mt-4 rounded-3xl p-5 text-white bg-gradient-to-br from-brand-500 to-brand-800 shadow-xl shadow-brand-700/30">
        <div className="text-[13px] text-white/80">Tổng hiện vật</div>
        <div className="text-[34px] font-extrabold leading-none mt-1">{total} <span className="text-base font-medium">đơn vị</span></div>
        <div className="grid grid-cols-3 gap-2 mt-4 bg-white/10 rounded-2xl p-3">
          {[[`${stored}`, 'ĐANG LƯU KHO'], [`${given}`, 'ĐÃ TRAO TẶNG'], [`${batches?.length ?? 0}`, 'LÔ HIỆN VẬT']].map(([a, b]) => (
            <div key={b} className="text-center"><div className="font-extrabold text-[15px]">{a}</div><div className="text-[10px] text-white/75">{b}</div></div>
          ))}
        </div>
      </div>

      <h2 className="text-base font-extrabold text-slate-800 px-5 mt-5 mb-2">Các lô hiện vật</h2>

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      <div className="px-4 space-y-3 pb-4">
        {batches?.map((b) => {
          const sm = statusMap[b.status] ?? statusMap.stored
          const gv = b.quantityTotal - b.quantityRemaining
          return (
            <Card key={b.id} className={b.status === 'given' ? 'opacity-80' : ''}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800"><span className="text-xl">{emojiFor(b.category)}</span> {b.name}</div>
                <Badge tone={sm.tone}>{sm.label}</Badge>
              </div>
              <div className="text-xs text-slate-400 mt-1.5">Người tặng: {b.donorName}</div>
              {b.status === 'partial' && <div className="mt-2"><Progress value={pct(gv, b.quantityTotal)} tone="bg-amber-500" /></div>}
              <div className="flex items-center justify-between mt-2">
                <span className="text-[13px] text-slate-500">Tồn: <b className="text-slate-700">{b.quantityRemaining}/{b.quantityTotal} {b.unit}</b>{gv > 0 && b.status !== 'given' ? ` · đã trao ${gv}` : b.status === 'given' ? ' · đã trao hết' : ''}</span>
                {b.quantityRemaining > 0 && (
                  <button onClick={() => nav(`/inventory/distribute/${b.id}`)} className="text-brand-700 bg-brand-50 font-bold text-[13px] px-3 py-1.5 rounded-lg flex items-center gap-1 active:bg-brand-100">
                    Phân phối <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
