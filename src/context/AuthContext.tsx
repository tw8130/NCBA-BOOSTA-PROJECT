import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Role } from '../types'

// Prototype-only auth: no real session, no token. A production build would
// replace this with real authentication and route guards enforced server-side
// (role separation here is for demonstration, not security).
interface AuthState {
  role: Role | null
  signInAs: (role: Role) => void
  signOut: () => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)

  return (
    <AuthContext.Provider
      value={{
        role,
        signInAs: (r) => setRole(r),
        signOut: () => setRole(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
