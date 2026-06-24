import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Info, Loader2 } from 'lucide-react'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { Button, Field, TopBar, Loading, ErrorBox, inputCls } from '../ui'

const emojiFor = (cat: string) => (cat === 'book' ? '📚' : cat === 'clothing' ? '🧥' : cat === 'supplies' ? '✏️' : '📦')

export default function Distribute() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data: batches, loading } = useFetch(() => api.inventory(), [])
  const { data: bens } = useFetch(() => api.beneficiaries(), [])
  const b = batches?.find((x) => String(x.id) === id)

  const [beneficiaryId, setBeneficiaryId] = useState<number | ''>('')
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // chọn mặc định điểm trường đầu tiên & số lượng gợi ý
  useEffect(() => { if (bens && bens[0]) setBeneficiaryId((v) => (v === '' ? bens[0].id : v)) }, [bens])
  useEffect(() => { if (b) setQty((v) => (v === '' ? String(Math.min(40, b.quantityRemaining)) : v)) }, [b])

  const submit = async () => {
    if (!b) return
    const n = Number(qty)
    if (!(n > 0) || n > b.quantityRemaining) { setErr(`Số lượng phải từ 1 đến ${b.quantityRemaining}`); return }
    if (!beneficiaryId) { setErr('Chọn điểm trường nhận'); return }
    setBusy(true); setErr('')
    try { await api.distribute(b.id, Number(beneficiaryId), n, note); nav('/inventory') }
    catch (e) { setErr((e as Error).message) }
    finally { setBusy(false) }
  }

  if (loading) return <div className="min-h-[100svh] bg-slate-50"><TopBar title="Phân phối hiện vật" back="/inventory" /><Loading /></div>
  if (!b) return <div className="min-h-[100svh] bg-slate-50"><TopBar title="Phân phối hiện vật" back="/inventory" /><ErrorBox message="Không tìm thấy lô hiện vật" /></div>

  return (
    <div className="min-h-[100svh] bg-slate-50">
      <TopBar title="Phân phối hiện vật" back="/inventory" />
      <div className="mx-4 mt-4 bg-white rounded-2xl p-3 flex items-center gap-3 border border-slate-100">
        <span className="w-11 h-11 rounded-xl bg-brand-50 grid place-items-center text-xl">{emojiFor(b.category)}</span>
        <div><div className="font-bold text-slate-800">{b.name}</div><div className="text-xs text-slate-400">Tồn kho: {b.quantityRemaining} {b.unit}</div></div>
      </div>

      <div className="pt-4">
        <Field label="Điểm trường nhận">
          <select className={inputCls} value={beneficiaryId} onChange={(e) => setBeneficiaryId(Number(e.target.value))}>
            {bens?.length === 0 && <option value="">— Chưa có điểm trường, hãy thêm ở mục Điểm trường —</option>}
            {bens?.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.province})</option>)}
          </select>
        </Field>
        <Field label={`Số lượng trao (tối đa ${b.quantityRemaining} ${b.unit})`}>
          <input className={inputCls} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ''))} />
        </Field>
        <Field label="Ghi chú (tuỳ chọn)"><input className={inputCls} placeholder="VD: Trao tận lớp học buổi sáng" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        <Field label="Ảnh trao tặng (minh chứng)">
          <div className="h-28 rounded-2xl border-2 border-dashed border-slate-300 grid place-items-center text-slate-400 bg-white">
            <div className="text-center"><Camera className="w-7 h-7 mx-auto" /><span className="text-xs">Chụp ảnh trao tặng</span></div>
          </div>
        </Field>
        <div className="mx-5 text-[12px] text-brand-700 bg-brand-50 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0" /> Sau khi xác nhận, tồn kho sẽ trừ tự động và ảnh lên mục “Hình ảnh thực tế” của chiến dịch.
        </div>
        {err && <div className="text-rose-600 text-[13px] text-center px-5 mt-2">{err}</div>}
        <div className="px-5 py-5"><Button onClick={submit} disabled={busy}>{busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : 'Xác nhận trao tặng'}</Button></div>
      </div>
    </div>
  )
}
