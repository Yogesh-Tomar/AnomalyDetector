import { createContext, useContext, useEffect, useState } from 'react'
import { endpoints } from './api'

export type UserRole = 'admin' | 'analyst' | null

export interface UserInfo {
  username: string
  role: UserRole
  email?: string
}

interface SessionContextType {
  user: UserInfo | null
  token: string | null
  setSession: (user: UserInfo | null, token: string | null) => void
  logout: () => void
  loading: boolean
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  token: null,
  setSession: () => {},
  logout: () => {},
  loading: true,
})


export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Rehydrate session from localStorage on mount and when jwt changes
  useEffect(() => {
    const syncSession = () => {
      const jwt = localStorage.getItem('jwt')
      const username = localStorage.getItem('username') || ''
      const role = (localStorage.getItem('role') as UserRole) || null
      const email = localStorage.getItem('email') || undefined
      if (jwt && username && role) {
        setUser({ username, role, email })
        setToken(jwt)
      } else {
        setUser(null)
        setToken(null)
      }
      setLoading(false)
    }
    syncSession()
    window.addEventListener('storage', syncSession)
    return () => window.removeEventListener('storage', syncSession)
  }, [])

  const setSession = (user: UserInfo | null, token: string | null) => {
    setUser(user)
    setToken(token)
    if (user && token) {
      localStorage.setItem('jwt', token)
      localStorage.setItem('role', user.role || '')
      localStorage.setItem('username', user.username)
      if (user.email) localStorage.setItem('email', user.email)
    } else {
      localStorage.removeItem('jwt')
      localStorage.removeItem('role')
      localStorage.removeItem('username')
      localStorage.removeItem('email')
    }
  }

  const logout = async () => {
    try { await endpoints.logout() } catch {}
    setSession(null, null)
  }

  return (
    <SessionContext.Provider value={{ user, token, setSession, logout, loading }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}
