import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Plus, X } from 'lucide-react'
import { api, type CampaignInput, type MilestoneInput } from '../../api'
import { Button, Field, TopBar, Loading, inputCls } from '../../ui'

const EMOJIS = ['🏫', '📚', '🧥', '⛰️', '✏️', '🎒', '🍚', '💧', '🩺', '🏠']
const STATUSES = [{ v: 'urgent', l: 'Khẩn cấp' }, { v: 'active', l: 'Đang gây quỹ' }, { v: 'done', l: 'Hoàn thành' }]
const STATES = [{ v: 'done', l: 'Đã xong' }, { v: 'now', l: 'Đang làm' }, { v: 'todo', l: 'Sắp tới' }]

export default function CampaignForm() {
  const nav = useNavigate()
  const { slug } = useParams()
  const editing = !!slug

  const [loading, setLoading] = useState(editing)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('active')
  const [emoji, setEmoji] = useState('🏫')
  const [goal, setGoal] = useState('')
  const [children, setChildren] = useState('')
  const [endDate, setEndDate] = useState('')
  const [story, setStory] = useState('')
  const [milestones, setMilestones] = useState<MilestoneInput[]>([])

  useEffect(() => {
    if (!editing) return
    api.adminCampaign(slug!)
      .then((c) => {
        setTitle(c.title); setLocation(c.location); setStatus(c.status); setEmoji(c.bannerEmoji ?? '🏫')
        setGoal(String(Number(c.goalAmount))); setChildren(String(c.childrenHelped))
        setEndDate(c.endDate ? c.endDate.slice(0, 10) : ''); setStory(c.story)
        setMilestones(c.milestones.map((m) => ({ label: m.label, dateLabel: m.dateLabel, description: m.description ?? '', state: m.state })))
      })
      .catch((e) => setErr((e as Error).message))
      .finally(() => setLoading(false))
  }, [slug, editing])

  const setMs = (i: number, patch: Partial<MilestoneInput>) =>
    setMilestones((arr) => arr.map((m, idx) => (idx === i ? { ...m, ...patch } : m)))
  const addMs = () => setMilestones((arr) => [...arr, { label: '', dateLabel: '', state: 'todo' }])
  const rmMs = (i: number) => setMilestones((arr) => arr.filter((_, idx) => idx !== i))

  const save = async () => {
    if (!title.trim()) { setErr('Nhập tên chiến dịch'); return }
    setBusy(true); setErr('')
    const data: CampaignInput = {
      title: title.trim(), location, status, story, goalAmount: Number(goal) || 0,
      bannerEmoji: emoji, endDate: endDate || null, childrenHelped: Number(children) || 0,
      milestones: milestones.filter((m) => m.label.trim()),
    }
    try {
      if (editing) await api.updateCampaign(slug!, data)
      else await api.createCampaign(data)
      nav('/admin/campaigns')
    } catch (e) { setErr((e as Error).message) }
    finally { setBusy(false) }
  }

  if (loading) return <div className="min-h-[100svh] bg-slate-50"><TopBar title="Sửa chiến dịch" back="/admin/campaigns" /><Loading /></div>

  return (
    <div className="min-h-[100svh] bg-slate-50 pb-6">
      <TopBar title={editing ? 'Sửa chiến dịch' : 'Tạo chiến dịch'} back="/admin/campaigns" />

      <div className="pt-4">
        <Field label="Tên chiến dịch"><input className={inputCls} placeholder="VD: Xây trường cho em tại Bản Mo" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Địa điểm"><input className={inputCls} placeholder="VD: Xín Mần, Hà Giang" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>

        <Field label="Ảnh đại diện (emoji)">
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => setEmoji(e)} className={`w-11 h-11 rounded-xl text-xl grid place-items-center border-[1.5px] ${emoji === e ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'}`}>{e}</button>
            ))}
          </div>
        </Field>

        <Field label="Trạng thái">
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.map((s) => (
              <button key={s.v} onClick={() => setStatus(s.v)} className={`py-2.5 rounded-xl text-[13px] font-bold border-[1.5px] ${status === s.v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}>{s.l}</button>
            ))}
          </div>
        </Field>

        <div className="flex gap-3 px-5 mb-3">
          <label className="flex-1"><span className="block text-[13px] font-semibold text-slate-600 mb-1.5">Mục tiêu (đồng)</span><input className={inputCls} inputMode="numeric" placeholder="200000000" value={goal} onChange={(e) => setGoal(e.target.value.replace(/\D/g, ''))} /></label>
          <label className="flex-1"><span className="block text-[13px] font-semibold text-slate-600 mb-1.5">Số trẻ hỗ trợ</span><input className={inputCls} inputMode="numeric" placeholder="45" value={children} onChange={(e) => setChildren(e.target.value.replace(/\D/g, ''))} /></label>
        </div>

        <Field label="Ngày kết thúc"><input type="date" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
        <Field label="Câu chuyện chiến dịch"><textarea className={inputCls} rows={4} placeholder="Mô tả hoàn cảnh và mục tiêu..." value={story} onChange={(e) => setStory(e.target.value)} /></Field>

        {/* Milestones */}
        <div className="px-5 mb-2 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-slate-600">Lộ trình triển khai</span>
          <button onClick={addMs} className="text-[12px] font-bold text-brand-700 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Thêm mốc</button>
        </div>
        <div className="px-4 space-y-2 mb-3">
          {milestones.map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 border border-slate-100">
              <div className="flex gap-2">
                <input className={inputCls + ' flex-1'} placeholder="Tên mốc (VD: Khởi công)" value={m.label} onChange={(e) => setMs(i, { label: e.target.value })} />
                <button onClick={() => rmMs(i)} className="w-9 h-9 shrink-0 rounded-xl bg-rose-50 text-rose-500 grid place-items-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2 mt-2">
                <input className={inputCls + ' flex-1'} placeholder="Thời gian (VD: 08/2024)" value={m.dateLabel} onChange={(e) => setMs(i, { dateLabel: e.target.value })} />
                <select className={inputCls + ' w-32'} value={m.state} onChange={(e) => setMs(i, { state: e.target.value })}>
                  {STATES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </div>
            </div>
          ))}
          {milestones.length === 0 && <p className="text-[12px] text-slate-400 px-1">Chưa có mốc nào (tuỳ chọn).</p>}
        </div>

        {err && <div className="text-rose-600 text-[13px] text-center px-5 mb-2">{err}</div>}
        <div className="px-5 py-2">
          <Button onClick={save} disabled={busy}>{busy ? <Loader2 className="w-5 h-5 animate-spin-slow" /> : editing ? 'Lưu thay đổi' : 'Tạo chiến dịch'}</Button>
        </div>
      </div>
    </div>
  )
}
