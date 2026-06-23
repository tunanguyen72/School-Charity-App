import { useEffect, useState } from 'react'
import { api, type AdminUser } from '../../api'
import { vndShort } from '../../format'
import { Avatar, Card, TopBar, Loading, ErrorBox } from '../../ui'

const ROLES = [{ v: 'donor', l: 'Nhà hảo tâm' }, { v: 'tnv', l: 'Tình nguyện viên' }, { v: 'admin', l: 'Admin' }]
const roleTone: Record<string, string> = { donor: 'bg-slate-100 text-slate-600', tnv: 'bg-amber-100 text-amber-700', admin: 'bg-brand-100 text-brand-700' }

export default function Users() {
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<number | null>(null)

  const load = () => api.adminUsers().then(setUsers).catch((e) => setError((e as Error).message))
  useEffect(() => { load() }, [])

  const change = async (id: number, role: string) => {
    setBusy(id); setError('')
    try { await api.setUserRole(id, role); await load() }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(null) }
  }

  return (
    <div className="min-h-[100svh] bg-slate-50 pb-6">
      <TopBar title="Người dùng & phân quyền" back="/admin" />
      {error && <ErrorBox message={error} />}
      {users === null && <Loading />}

      <div className="px-4 mt-4 space-y-2.5">
        {users?.map((u) => (
          <Card key={u.id} className="!p-3.5">
            <div className="flex items-center gap-3">
              <Avatar initials={u.fullName.split(' ').slice(-1)[0][0] ?? 'U'} className={`w-11 h-11 ${busy === u.id ? 'opacity-50' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-800 text-sm truncate">{u.fullName}</div>
                <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${roleTone[u.role]}`}>{ROLES.find((r) => r.v === u.role)?.l}</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] text-slate-400 flex-1">Đã góp {vndShort(u.donated)} · {u.donationCount} lượt</span>
              <select value={u.role} disabled={busy === u.id} onChange={(e) => change(u.id, e.target.value)}
                className="text-[12px] font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                {ROLES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
              </select>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-center text-[11px] text-slate-400 mt-4 px-8">Đổi vai trò để cấp quyền Tình nguyện viên (ghi nhận hiện vật) hoặc Admin (toàn quyền).</p>
    </div>
  )
}
