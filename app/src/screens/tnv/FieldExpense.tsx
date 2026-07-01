import { useEffect, useState } from 'react'
import { Loader2, Plus, Clock, BadgeCheck, XCircle } from 'lucide-react'
import { api, type FieldExpense as FE, type UICampaign } from '../../api'
import { vnd, vndShort } from '../../format'
import { Button, Card, Badge, Field, TopBar, Loading, inputCls } from '../../ui'

const statusInfo: Record<string, { tone: 'amber' | 'green' | 'red'; label: string; icon: typeof Clock }> = {
  pending: { tone: 'amber', label: 'Chờ duyệt', icon: Clock },
  verified: { tone: 'green', label: 'Đã duyệt', icon: BadgeCheck },
  rejected: { tone: 'red', label: 'Từ chối', icon: XCircle },
}

export default function FieldExpense() {
  const [list, setList] = useState<FE[] | null>(null)
  const [campaigns, setCampaigns] = useState<UICampaign[]>([])
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const load = async () => {
    const [e, c] = await Promise.all([api.myFieldExpenses(), api.campaigns()])
    setList(e); setCampaigns(c); if (!slug && c[0]) setSlug(c[0].id)
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (!title.trim() || !amount) { setErr('Nhập nội dung và số tiền'); return }
    setBusy(true); setErr('')
    try { await api.submitFieldExpense(slug, title, Number(amount)); setTitle(''); setAmount(''); await load() }
    catch (e) { setErr((e as Error).message) }
    finally { setBusy(false) }
  }

  const pendingTotal = (list ?? []).filter((e) => e.status === 'pending').length

  return (
    <div className="min-h-[100svh] app-canvas pb-6">
      <TopBar title="Chi phí thực địa" back="/home" />

      <Card className="mx-4 mt-4 !p-4">
        <div className="text-[13px] font-semibold text-ink-600 mb-2">Gửi đề nghị chi phí (admin sẽ duyệt)</div>
        <Field label="Chiến dịch">
          <select className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)}>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </Field>
        <Field label="Nội dung chi"><input className={inputCls} placeholder="VD: Thuê xe chở vật tư lên bản" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Số tiền (đồng)"><input className={inputCls} inputMode="numeric" placeholder="VD: 2000000" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} /></Field>
        {err && <div className="text-rose-600 text-[13px] text-center mb-2">{err}</div>}
        <div className="px-1"><Button onClick={submit} disabled={busy}>{busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : <><Plus className="w-4 h-4" /> Gửi đề nghị</>}</Button></div>
      </Card>

      <div className="flex items-center justify-between px-5 mt-5 mb-2">
        <h2 className="text-base font-extrabold text-ink-900">Đề nghị của tôi</h2>
        {pendingTotal > 0 && <Badge tone="amber">{pendingTotal} chờ duyệt</Badge>}
      </div>
      {list === null && <Loading />}
      {list?.length === 0 && <p className="text-center text-ink-400 text-sm py-4">Chưa gửi đề nghị nào.</p>}
      <div className="px-4 space-y-2">
        {list?.map((e) => {
          const si = statusInfo[e.status] ?? statusInfo.pending
          const Icon = si.icon
          return (
            <Card key={e.id} className="!p-3.5 flex items-center gap-3">
              <span className={`w-9 h-9 rounded-xl grid place-items-center ${e.status === 'verified' ? 'bg-emerald-100 text-emerald-600' : e.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}><Icon className="w-5 h-5" /></span>
              <div className="flex-1 min-w-0"><b className="text-ink-900 text-sm">{e.title}</b><div className="text-xs text-ink-400 truncate">{e.campaign.title}</div></div>
              <div className="text-right"><b className="text-rose-600 text-[13px]">{vnd(Number(e.amount))}</b><div><Badge tone={si.tone} className="!text-[9px] !px-1.5 !py-0.5">{si.label}</Badge></div></div>
            </Card>
          )
        })}
      </div>
      <p className="text-center text-[11px] text-ink-400 mt-4 px-8">Tổng đã được duyệt: {vndShort((list ?? []).filter((e) => e.status === 'verified').reduce((s, e) => s + Number(e.amount), 0))}</p>
    </div>
  )
}
