import { CheckCheck } from 'lucide-react'
import { api } from '../api'
import { useFetch } from '../useFetch'
import { TopBar, Loading, ErrorBox } from '../ui'

const meta: Record<string, { icon: string; tone: string }> = {
  donation_success: { icon: '💝', tone: 'bg-emerald-100 text-emerald-600' },
  campaign_update: { icon: '📢', tone: 'bg-brand-100 text-brand-600' },
  txn_verified: { icon: '✅', tone: 'bg-emerald-100 text-emerald-600' },
  report: { icon: '📊', tone: 'bg-slate-100 text-ink-600' },
  system: { icon: '🔔', tone: 'bg-slate-100 text-ink-600' },
}

const groupOf = (iso: string) => {
  const d = new Date(iso); const now = new Date()
  const days = Math.floor((now.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000)
  return days <= 0 ? 'Hôm nay' : days === 1 ? 'Hôm qua' : 'Trước đó'
}

export default function Notifications() {
  const { data: items, loading, error } = useFetch(() => api.notifications(), [])
  const groups = ['Hôm nay', 'Hôm qua', 'Trước đó']

  return (
    <div className="min-h-[100svh] app-canvas pb-4">
      <TopBar title="Thông báo" back="/home" right={<CheckCheck className="w-5 h-5" />} />
      {loading && <Loading />}
      {error && <ErrorBox message={error} />}

      {groups.map((g) => {
        const list = items?.filter((n) => groupOf(n.createdAt) === g) ?? []
        if (!list.length) return null
        return (
          <div key={g}>
            <div className="px-5 pt-4 pb-1 text-[12px] font-bold text-ink-400 tracking-wide">{g.toUpperCase()}</div>
            <div className="mx-4 bg-white rounded-2xl overflow-hidden">
              {list.map((n) => {
                const m = meta[n.type] ?? meta.system
                return (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3.5 border-b border-slate-100 last:border-0">
                    <span className={`w-10 h-10 rounded-xl grid place-items-center text-lg shrink-0 ${m.tone}`}>{m.icon}</span>
                    <div className="flex-1 min-w-0"><b className="text-ink-900 text-sm">{n.title}</b><div className="text-[13px] text-ink-500 leading-snug">{n.body}</div></div>
                    <span className="text-[11px] text-ink-400 shrink-0">{new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="mx-4 mt-4 rounded-3xl p-5 text-white bg-gradient-to-br from-brand-600 to-brand-800 text-center">
        <div className="font-extrabold">Góp sức cùng 12.000+ nhà hảo tâm</div>
        <p className="text-[13px] text-white/80 mt-1">Mỗi đóng góp là một câu chuyện thắp sáng con đường đến trường của các em.</p>
      </div>
    </div>
  )
}
