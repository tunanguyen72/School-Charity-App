import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Loader2, X } from 'lucide-react'
import { api } from '../api'
import { compressImage } from '../img'
import { Button, Field, TopBar, inputCls } from '../ui'

export default function Receive() {
  const nav = useNavigate()
  const [name, setName] = useState('Sách giáo khoa lớp 3')
  const [category, setCategory] = useState('book')
  const [quantity, setQuantity] = useState('100')
  const [unit, setUnit] = useState('bộ')
  const [donorName, setDonorName] = useState('Công ty TechCloud')
  const [campaignSlug, setCampaignSlug] = useState('ban-mo')
  const [photo, setPhoto] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const onPick = async (file?: File) => {
    if (!file) return
    setPhotoBusy(true); setErr('')
    try { setPhoto(await compressImage(file)) }
    catch (e) { setErr((e as Error).message) }
    finally { setPhotoBusy(false) }
  }

  const save = async () => {
    setBusy(true); setErr('')
    try {
      await api.receiveInventory({ name, category, donorName, campaignSlug, unit, quantity: Number(quantity), photo: photo || undefined })
      nav('/inventory')
    } catch (e) { setErr((e as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-[100svh] bg-slate-50">
      <TopBar title="Nhận hiện vật" back="/inventory" />
      <div className="pt-4">
        <Field label="Tên đồ vật"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Loại">
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="book">Sách / Vở</option><option value="clothing">Quần áo</option><option value="supplies">Đồ dùng học tập</option><option value="other">Khác</option>
          </select>
        </Field>
        <div className="flex gap-3 px-5 mb-3">
          <label className="flex-1"><span className="block text-[13px] font-semibold text-slate-600 mb-1.5">Số lượng</span><input className={inputCls} value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))} inputMode="numeric" /></label>
          <label className="flex-1"><span className="block text-[13px] font-semibold text-slate-600 mb-1.5">Đơn vị</span><select className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value)}><option>bộ</option><option>cái</option><option>kg</option></select></label>
        </div>
        <Field label="Người tặng"><input className={inputCls} value={donorName} onChange={(e) => setDonorName(e.target.value)} /></Field>
        <Field label="Gắn vào chiến dịch">
          <select className={inputCls} value={campaignSlug} onChange={(e) => setCampaignSlug(e.target.value)}>
            <option value="ban-mo">Xây trường Bản Mo</option><option value="tu-sach">Tủ sách yêu thương</option><option value="nam-pam">Điểm trường Nậm Pầm</option>
          </select>
        </Field>
        <Field label="Ảnh hiện vật">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
          {photo ? (
            <div className="relative">
              <img src={photo} alt="Ảnh hiện vật" className="w-full h-44 object-cover rounded-2xl" />
              <button onClick={() => { setPhoto(''); if (fileRef.current) fileRef.current.value = '' }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/55 text-white grid place-items-center"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} className="w-full h-28 rounded-2xl border-2 border-dashed border-slate-300 grid place-items-center text-slate-400 bg-white active:bg-slate-50">
              {photoBusy ? <Loader2 className="w-7 h-7 animate-spin-slow" /> : <div className="text-center"><Camera className="w-7 h-7 mx-auto" /><span className="text-xs">Chụp / chọn ảnh hiện vật</span></div>}
            </button>
          )}
        </Field>
        {err && <div className="text-rose-600 text-[13px] text-center px-5">{err}</div>}
        <div className="px-5 py-5"><Button onClick={save} disabled={busy}>{busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : 'Lưu vào kho'}</Button></div>
      </div>
    </div>
  )
}
