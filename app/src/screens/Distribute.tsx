import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Info } from 'lucide-react'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { Button, Field, TopBar, Loading, inputCls } from '../ui'

const emojiFor = (cat: string) => (cat === 'book' ? '📚' : cat === 'clothing' ? '🧥' : cat === 'supplies' ? '✏️' : '📦')

export default function Distribute() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: batches, loading } = useFetch(() => api.inventory(), [])
  const b = batches?.find((x) => String(x.id) === id)

  if (loading) return <div className="min-h-[100svh] bg-slate-50"><TopBar title="Phân phối hiện vật" back="/inventory" /><Loading /></div>

  return (
    <div className="min-h-[100svh] bg-slate-50">
      <TopBar title="Phân phối hiện vật" back="/inventory" />
      {b && (
        <div className="mx-4 mt-4 bg-white rounded-2xl p-3 flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-brand-50 grid place-items-center text-xl">{emojiFor(b.category)}</span>
          <div><div className="font-bold text-slate-800">{b.name}</div><div className="text-xs text-slate-400">Tồn: {b.quantityRemaining} {b.unit}</div></div>
        </div>
      )}

      <div className="pt-4">
        <Field label="Điểm trường nhận">
          <select className={inputCls}><option>Điểm trường Bản Mo</option><option>Điểm trường Nậm Pầm</option><option>Điểm trường Mèo Vạc</option></select>
        </Field>
        <Field label="Số lượng trao"><input className={inputCls} defaultValue={b ? Math.min(40, b.quantityRemaining) : 40} inputMode="numeric" /></Field>
        <Field label="Ảnh trao tặng (minh chứng)">
          <div className="h-28 rounded-2xl border-2 border-dashed border-slate-300 grid place-items-center text-slate-400 bg-white">
            <div className="text-center"><Camera className="w-7 h-7 mx-auto" /><span className="text-xs">Chụp ảnh trao tặng</span></div>
          </div>
        </Field>
        <div className="mx-5 text-[12px] text-brand-700 bg-brand-50 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0" /> Ảnh sẽ tự động hiển thị ở mục “Hình ảnh thực tế” của chiến dịch.
        </div>
        <div className="px-5 py-5"><Button onClick={() => nav('/inventory')}>Xác nhận trao tặng</Button></div>
      </div>
    </div>
  )
}
