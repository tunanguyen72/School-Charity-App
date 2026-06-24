import { createContext, useContext, useState, type ReactNode } from 'react'
import { api, setToken, type ApiUser } from './api'

type Role = 'donor' | 'tnv' | 'admin'

interface DonationDraft {
  campaignId: string
  amount: number
  message: string
  anonymous: boolean
  txnCode: string
}

interface AppState {
  user: ApiUser | null
  role: Role
  login: (email: string, password: string) => Promise<ApiUser>
  register: (fullName: string, email: string, password: string, role: 'donor' | 'tnv') => Promise<ApiUser>
  logout: () => void
  draft: DonationDraft
  setDraft: (d: Partial<DonationDraft>) => void
}

const Ctx = createContext<AppState | null>(null)

const USER_KEY = 'cedt_user'
const loadUser = (): ApiUser | null => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(loadUser)
  const [draft, setDraftState] = useState<DonationDraft>({
    campaignId: 'ban-mo', amount: 500_000, message: '', anonymous: false, txnCode: '',
  })

  const applyAuth = (token: string, u: ApiUser) => {
    setToken(token)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
    return u
  }

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password)
    return applyAuth(token, user)
  }
  const register = async (fullName: string, email: string, password: string, role: 'donor' | 'tnv') => {
    const { token, user } = await api.register(fullName, email, password, role)
    return applyAuth(token, user)
  }
  const logout = () => {
    setToken(null)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const setDraft = (d: Partial<DonationDraft>) => setDraftState((prev) => ({ ...prev, ...d }))

  return (
    <Ctx.Provider value={{ user, role: (user?.role as Role) ?? 'donor', login, register, logout, draft, setDraft }}>
      {children}
    </Ctx.Provider>
  )
}

export function useApp() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp must be used within AppProvider')
  return c
}
