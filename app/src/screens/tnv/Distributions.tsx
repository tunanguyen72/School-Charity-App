import { useState } from 'react'
import { api, type DistributionRow } from '../../api'
import { useFetch } from '../../useFetch'
import { Card, TopBar, Loading, ErrorBox } from '../../ui'
import { ImageIcon, MapPin, X } from 'lucide-react'

const emojiFor = (cat: string) => (cat === 'book' ? '📚' : cat === 'clothing' ? '🧥' : cat === 'supplies' ? '✏️' : '📦')

export default function Distributions() {
  const { data, loading, error } = useFetch(() => api.distributions(), [])
  const [zoom, setZoom] = useState<string | null>(null)

  const totalItems = (data ?? []).reduce((s, d) => s + d.quantity, 0)

  return (
    <div className="min-h-[100svh] app-canvas pb-6">
      <TopBar title="Lịch sử phân phối" back="/home" />

      {data && data.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-4 pt-4">
          <Card className="!p-3 text-center"><div className="font-extrabold text-base text-brand-700">{data.length}</div><div className="text-[10px] text-ink-400">LẦN PHÂN PHỐI</div></Card>
          <Card className="!p-3 text-center"><div className="font-extrabold text-base text-emerald-600">{totalItems}</div><div className="text-[10px] text-ink-400">ĐƠN VỊ ĐÃ TRAO</div></Card>
        </div>
      )}

      {loading && <Loading />}
      {error && <ErrorBox message={error} />}
      {data?.length === 0 && <p className="text-center text-ink-400 text-sm py-10">Chưa có lần phân phối nào.</p>}

      <div className="px-4 mt-4 space-y-3">
        {data?.map((d: DistributionRow) => (
          <Card key={d.id} className="!p-3">
            <div className="flex gap-3">
              {d.photoUrl ? (
                <img src={d.photoUrl} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0" onClick={() => setZoom(d.photoUrl)} />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 grid place-items-center text-slate-300 shrink-0"><ImageIcon className="w-7 h-7" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-ink-900 text-sm">{emojiFor(d.category)} {d.quantity} {d.unit} {d.item}</div>
                <div className="text-[12px] text-ink-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {d.to} · {d.province}</div>
                <div className="text-[11px] text-ink-400 mt-0.5 truncate">{d.campaign}</div>
                {d.note && <div className="text-[11px] text-ink-400 mt-0.5 italic truncate">“{d.note}”</div>}
                <div className="text-[11px] text-ink-400 mt-1">👤 {d.by} · {new Date(d.at).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Phóng to ảnh */}
      {zoom && (
        <div className="fixed inset-0 z-50 bg-black/85 grid place-items-center p-5" onClick={() => setZoom(null)}>
          <img src={zoom} alt="" className="max-w-full max-h-[80vh] rounded-2xl" />
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 text-white grid place-items-center"><X className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  )
}
