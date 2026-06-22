import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Banknote, Package, Loader2 } from 'lucide-react'
import { quickAmounts } from '../data'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { useApp } from '../store'
import { vnd, vndShort, pct } from '../format'
import { Button, Field, TopBar, Loading, ErrorBox, inputCls } from '../ui'

export default function Donate() {
  const { id } = useParams()
  const nav = useNavigate()
  const { setDraft } = useApp()
  const { data: c, loading, error } = useFetch(() => api.campaign(id!), [id])
  const [amount, setAmount] = useState(500_000)
  const [custom, setCustom] = useState('')
  const [anon, setAnon] = useState(false)
  const [msg, setMsg] = useState('')
  const [mode, setMode] = useState<'cash' | 'inkind'>('cash')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (loading) return <div className="min-h-full bg-slate-50"><TopBar title="Quyên góp" back /><Loading /></div>
  if (error || !c) return <div className="min-h-full bg-slate-50"><TopBar title="Quyên góp" back /><ErrorBox message={error ?? 'Không tìm thấy'} /></div>

  const proceed = async () => {
    setBusy(true); setErr('')
    try {
      const d = await api.createDonation(c.id, amount, msg, anon)
      setDraft({ campaignId: c.id, amount, anonymous: anon, message: msg, txnCode: d.txnCode })
      nav('/qr')
    } catch (e) { setErr((e as Error).message) }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <TopBar title="Quyên góp" back={`/campaign/${c.id}`} />

      <div className="mx-4 mt-4 bg-white rounded-2xl p-3 flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient} grid place-items-center text-2xl`}>{c.emoji}</div>
        <div className="min-w-0"><div className="font-bold text-slate-800 text-sm truncate">{c.title}</div><div className="text-xs text-slate-400">📍 {c.location} · {pct(c.raised, c.goal)}%</div></div>
      </div>

      <div className="mx-4 mt-4 grid grid-cols-2 bg-slate-200/70 rounded-2xl p-1">
        <button onClick={() => setMode('cash')} className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition ${mode === 'cash' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'}`}><Banknote className="w-4 h-4" /> Tiền mặt</button>
        <button onClick={() => setMode('inkind')} className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition ${mode === 'inkind' ? 'bg-white text-brand-700 shadow' : 'text-slate-500'}`}><Package className="w-4 h-4" /> Hiện vật</button>
      </div>

      {mode === 'inkind' ? (
        <div className="mx-5 mt-5 text-center text-slate-500 text-sm bg-white rounded-2xl p-6">
          <div className="text-3xl mb-2">📦</div>
          Quyên góp hiện vật được ghi nhận trực tiếp bởi tình nguyện viên tại điểm tiếp nhận. Vui lòng liên hệ để được hướng dẫn.
        </div>
      ) : (
        <>
          <Field label="Chọn số tiền quyên góp">
            <div className="grid grid-cols-3 gap-2.5">
              {quickAmounts.map((a) => (
                <button key={a} onClick={() => { setAmount(a); setCustom('') }} className={`py-3 rounded-2xl font-bold text-sm border-[1.5px] transition ${amount === a && !custom ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                  {vndShort(a)}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Hoặc nhập số tiền khác">
            <input className={inputCls} inputMode="numeric" placeholder="Nhập số tiền..." value={custom}
              onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setCustom(v); if (v) setAmount(Number(v)) }} />
          </Field>
          <Field label="Lời nhắn (tuỳ chọn)">
            <textarea className={inputCls} rows={2} placeholder="Gửi lời động viên tới các em..." value={msg} onChange={(e) => setMsg(e.target.value)} />
          </Field>
          <Field label="Hiển thị thông tin">
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setAnon(false)} className={`py-3 rounded-2xl text-sm font-semibold border-[1.5px] ${!anon ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}>👤 Công khai tên</button>
              <button onClick={() => setAnon(true)} className={`py-3 rounded-2xl text-sm font-semibold border-[1.5px] ${anon ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}>🙈 Ẩn danh</button>
            </div>
          </Field>

          {err && <div className="text-rose-600 text-[13px] text-center px-5">{err}</div>}
          <div className="px-5 pb-6 pt-1">
            <Button onClick={proceed} disabled={!amount || busy}>{busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : `Tiếp tục — ${vnd(amount || 0)}`}</Button>
          </div>
        </>
      )}
    </div>
  )
}
