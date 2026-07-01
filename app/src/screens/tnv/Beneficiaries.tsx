import { useEffect, useState } from 'react'
import { Loader2, Plus, MapPin, School } from 'lucide-react'
import { api, type Beneficiary } from '../../api'
import { Button, Card, Field, TopBar, Loading, inputCls } from '../../ui'

export default function Beneficiaries() {
  const [list, setList] = useState<Beneficiary[] | null>(null)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [province, setProvince] = useState('')
  const [location, setLocation] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const load = () => api.beneficiaries().then(setList).catch((e) => setErr((e as Error).message))
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!name.trim()) { setErr('Nhập tên điểm trường'); return }
    setBusy(true); setErr('')
    try { await api.createBeneficiary(name, province, location); setName(''); setProvince(''); setLocation(''); setAdding(false); await load() }
    catch (e) { setErr((e as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-[100svh] app-canvas pb-6">
      <TopBar title="Điểm trường" back="/home"
        right={<button onClick={() => setAdding((v) => !v)} className="p-1.5 rounded-full bg-brand-600 text-white active:scale-95"><Plus className="w-5 h-5" /></button>} />

      {adding && (
        <Card className="mx-4 mt-4 !p-4">
          <div className="text-[13px] font-semibold text-ink-600 mb-2">Thêm điểm trường mới</div>
          <Field label="Tên điểm trường"><input className={inputCls} placeholder="VD: Điểm trường Bản Mo" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Tỉnh"><input className={inputCls} placeholder="VD: Hà Giang" value={province} onChange={(e) => setProvince(e.target.value)} /></Field>
          <Field label="Xã / Huyện"><input className={inputCls} placeholder="VD: Xín Mần" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
          {err && <div className="text-rose-600 text-[13px] text-center mb-2">{err}</div>}
          <div className="px-1"><Button onClick={save} disabled={busy}>{busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : 'Lưu điểm trường'}</Button></div>
        </Card>
      )}

      {list === null && <Loading />}
      <div className="px-4 mt-4 space-y-2.5">
        {list?.map((b) => (
          <Card key={b.id} className="!p-3.5 flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-600 grid place-items-center"><School className="w-5 h-5" /></span>
            <div className="flex-1 min-w-0">
              <b className="text-ink-900 text-sm">{b.name}</b>
              <div className="text-xs text-ink-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.province}{b.location ? ` · ${b.location}` : ''}</div>
            </div>
            <span className="text-[11px] text-ink-500 bg-slate-100 px-2 py-1 rounded-lg">{b.distributionCount} lần trao</span>
          </Card>
        ))}
        {list?.length === 0 && <p className="text-center text-ink-400 text-sm py-8">Chưa có điểm trường. Bấm ＋ để thêm.</p>}
      </div>
    </div>
  )
}
