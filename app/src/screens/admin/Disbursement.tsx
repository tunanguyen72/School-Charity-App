import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, BadgeCheck, XCircle, Clock, Loader2, Plus } from 'lucide-react'
import { api, type AdminExpense, type UICampaign } from '../../api'
import { vnd, vndShort } from '../../format'
import { Button, Card, Badge, TopBar, Field, Loading, inputCls } from '../../ui'

const typeLabel = (t: string) => (t === 'disbursement' ? 'Giải ngân' : 'Chi phí TNV')

export default function Disbursement() {
  const nav = useNavigate()
  const [expenses, setExpenses] = useState<AdminExpense[] | null>(null)
  const [campaigns, setCampaigns] = useState<UICampaign[]>([])
  const [busyId, setBusyId] = useState<number | null>(null)

  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [creating, setCreating] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    const [e, c] = await Promise.all([api.adminExpenses(), api.campaigns()])
    setExpenses(e); setCampaigns(c)
    if (!slug && c[0]) setSlug(c[0].id)
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const create = async () => {
    if (!title || !amount) { setErr('Nhập đủ nội dung và số tiền'); return }
    setCreating(true); setErr('')
    try {
      await api.createExpense(slug, title, Number(amount), 'disbursement')
      setTitle(''); setAmount('')
      await load()
    } catch (e) { setErr((e as Error).message) }
    finally { setCreating(false) }
  }
  const act = async (id: number, kind: 'verify' | 'reject') => {
    setBusyId(id)
    try { await (kind === 'verify' ? api.verifyExpense(id) : api.rejectExpense(id)); await load() }
    finally { setBusyId(null) }
  }

  const pending = expenses?.filter((e) => e.status === 'pending') ?? []
  const resolved = expenses?.filter((e) => e.status !== 'pending') ?? []
  const totalVerified = (expenses ?? []).filter((e) => e.status === 'verified').reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="min-h-[100svh] bg-slate-50 pb-4">
      <TopBar title="Giải ngân & chi phí" back="/admin" right={<ShieldCheck className="w-5 h-5 text-emerald-500" />} />

      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        {[[`${pending.length}`, 'CHỜ DUYỆT', 'text-amber-600'], [vndShort(totalVerified), 'ĐÃ GIẢI NGÂN', 'text-emerald-600'], [`${expenses?.length ?? 0}`, 'TỔNG KHOẢN', 'text-brand-700']].map(([a, b, c]) => (
          <Card key={b} className="!p-3 text-center"><div className={`font-extrabold text-base ${c}`}>{a}</div><div className="text-[10px] text-slate-400 mt-0.5">{b}</div></Card>
        ))}
      </div>

      <h2 className="text-base font-extrabold text-slate-800 px-5 mt-5 mb-2">Tạo khoản giải ngân</h2>
      <Card className="mx-4 !p-4">
        <Field label="Chiến dịch">
          <select className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)}>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </Field>
        <Field label="Nội dung chi"><input className={inputCls} placeholder="VD: Mua bàn ghế cho lớp học" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Số tiền (đồng)"><input className={inputCls} inputMode="numeric" placeholder="VD: 12000000" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} /></Field>
        {err && <div className="text-rose-600 text-[13px] text-center mb-2">{err}</div>}
        <div className="px-1"><Button onClick={create} disabled={creating}>{creating ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : <><Plus className="w-4 h-4" /> Tạo khoản chi</>}</Button></div>
      </Card>

      <h2 className="text-base font-extrabold text-slate-800 px-5 mt-5 mb-2">Chờ xác minh / duyệt</h2>
      {expenses === null && <Loading />}
      {expenses && pending.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Không có khoản nào chờ xử lý 🎉</p>}
      <div className="px-4 space-y-2">
        {pending.map((e) => (
          <Card key={e.id} className="!p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <b className="text-slate-800">{e.title}</b>
                <div className="text-xs text-slate-400 mt-0.5">{e.campaign.title} · {typeLabel(e.type)} · {e.submittedBy.fullName}</div>
              </div>
              <b className="text-rose-600 shrink-0">-{vndShort(Number(e.amount))}</b>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge tone="amber"><Clock className="w-3 h-3" /> Chờ chứng từ</Badge>
              <div className="flex-1" />
              <button onClick={() => act(e.id, 'reject')} disabled={busyId === e.id} className="px-3 py-1.5 rounded-lg text-[13px] font-bold text-rose-600 bg-rose-50 active:bg-rose-100">Từ chối</button>
              <button onClick={() => act(e.id, 'verify')} disabled={busyId === e.id} className="px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-emerald-600 active:scale-95 flex items-center gap-1">
                {busyId === e.id ? <Loader2 className="w-3.5 h-3.5 animate-spin-slow" /> : <BadgeCheck className="w-3.5 h-3.5" />} Xác minh
              </button>
            </div>
          </Card>
        ))}
      </div>

      {resolved.length > 0 && (
        <>
          <h2 className="text-base font-extrabold text-slate-800 px-5 mt-5 mb-2">Đã xử lý</h2>
          <div className="px-4 space-y-2">
            {resolved.map((e) => (
              <Card key={e.id} className="!p-3 flex items-center gap-3 opacity-90">
                <span className={`w-9 h-9 rounded-xl grid place-items-center ${e.status === 'verified' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {e.status === 'verified' ? <BadgeCheck className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </span>
                <div className="flex-1 min-w-0"><b className="text-slate-800 text-sm">{e.title}</b><div className="text-xs text-slate-400 truncate">{e.campaign.title}</div></div>
                <div className="text-right">
                  <b className="text-rose-600 text-[13px]">-{vnd(Number(e.amount))}</b>
                  <div><Badge tone={e.status === 'verified' ? 'blue' : 'red'} className="!text-[9px] !px-1.5 !py-0.5">{e.status === 'verified' ? 'ĐÃ XÁC MINH' : 'TỪ CHỐI'}</Badge></div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="px-4 mt-4">
        <Button variant="ghost" onClick={() => nav('/transactions')}>Xem sổ quỹ đầy đủ →</Button>
      </div>
    </div>
  )
}
