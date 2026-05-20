import { createContext, useContext, useState, type ReactNode } from 'react'
import { db } from '../data/db'

export interface AuthUser {
  username: string
  level: number
  levelDesp: string
}

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const s = sessionStorage.getItem('vrs_user')
      return s ? (JSON.parse(s) as AuthUser) : null
    } catch {
      return null
    }
  })

  const login = async (username: string, password: string): Promise<AuthUser> => {
    const record = await db.sys_user.get(username)
    if (!record || record.Password !== password) {
      throw new Error('Invalid username or password')
    }
    const level = await db.sys_userLevel.get(record.UserLevel)
    const u: AuthUser = {
      username: record.UserName,
      level: record.UserLevel,
      levelDesp: level?.LevelDesp ?? String(record.UserLevel),
    }
    sessionStorage.setItem('vrs_user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const logout = () => {
    sessionStorage.removeItem('vrs_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// User level constants (from tblSys_UserLevel)
// 1 = System Admin, 2 = Read Only, 3 = Read/Write, 4 = Edit, 5 = DB Admin
export const LEVEL_ADMIN = 1
export const LEVEL_READONLY = 2
export const LEVEL_READWRITE = 3
export const LEVEL_EDIT = 4
export const LEVEL_DBADMIN = 5

export function canWrite(level: number): boolean {
  return level === LEVEL_READWRITE || level === LEVEL_EDIT || level === LEVEL_ADMIN || level === LEVEL_DBADMIN
}
