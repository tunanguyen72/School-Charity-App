import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { api, type UICampaign } from '../../api'
import { vndShort, pct } from '../../format'
import { Card, Badge, TopBar, Loading, ErrorBox } from '../../ui'

const statusInfo: Record<string, { tone: 'red' | 'blue' | 'green'; label: string }> = {
  urgent: { tone: 'red', label: 'Khẩn cấp' },
  active: { tone: 'blue', label: 'Đang gây quỹ' },
  done: { tone: 'green', label: 'Hoàn thành' },
}

export default function CampaignManage() {
  const nav = useNavigate()
  const [list, setList] = useState<UICampaign[] | null>(null)
  const [error, setError] = useState('')
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = () => api.campaigns().then(setList).catch((e) => setError((e as Error).message))
  useEffect(() => { load() }, [])

  const del = async (slug: string) => {
    setBusy(slug)
    try { await api.deleteCampaign(slug); setConfirmSlug(null); await load() }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(null) }
  }

  return (
    <div className="min-h-[100svh] bg-slate-50 pb-6">
      <TopBar title="Quản lý chiến dịch" back="/admin"
        right={<button onClick={() => nav('/admin/campaigns/new')} className="p-1.5 rounded-full bg-brand-600 text-white active:scale-95"><Plus className="w-5 h-5" /></button>} />

      {error && <ErrorBox message={error} />}
      {list === null && <Loading />}

      <div className="px-4 mt-4 space-y-3">
        {list?.map((c) => {
          const si = statusInfo[c.status] ?? statusInfo.active
          return (
            <Card key={c.id} className="!p-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} grid place-items-center text-2xl shrink-0`}>{c.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{c.title}</div>
                  <div className="flex items-center gap-2 mt-1"><Badge tone={si.tone} className="!text-[9px] !px-1.5 !py-0.5">{si.label}</Badge><span className="text-[11px] text-slate-400">{vndShort(c.raised)} · {pct(c.raised, c.goal)}%</span></div>
                </div>
              </div>
              {confirmSlug === c.id ? (
                <div className="flex items-center gap-2 mt-3 bg-rose-50 rounded-xl p-2">
                  <span className="text-[12px] text-rose-600 flex-1 px-1">Xóa vĩnh viễn chiến dịch & mọi dữ liệu liên quan?</span>
                  <button onClick={() => setConfirmSlug(null)} className="px-3 py-1.5 rounded-lg text-[13px] font-bold text-slate-500 bg-white">Hủy</button>
                  <button onClick={() => del(c.id)} disabled={busy === c.id} className="px-3 py-1.5 rounded-lg text-[13px] font-bold text-white bg-rose-600 flex items-center gap-1">
                    {busy === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin-slow" /> : <Trash2 className="w-3.5 h-3.5" />} Xóa
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => nav(`/admin/campaigns/${c.id}/edit`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-bold text-brand-700 bg-brand-50 active:bg-brand-100"><Pencil className="w-4 h-4" /> Sửa</button>
                  <button onClick={() => setConfirmSlug(c.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-bold text-rose-600 bg-rose-50 active:bg-rose-100"><Trash2 className="w-4 h-4" /> Xóa</button>
                </div>
              )}
            </Card>
          )
        })}
        {list?.length === 0 && <p className="text-center text-slate-400 text-sm py-8">Chưa có chiến dịch nào. Bấm ＋ để tạo mới.</p>}
      </div>
    </div>
  )
}
