import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type Role = 'citizen' | 'officer' | 'policymaker' | null
export type ViewMode = 'stakeholder' | 'backend' | 'split'

interface RoleContextType {
  role: Role
  setRole: (role: Role) => void
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  backendUrl: string
  setBackendUrl: (url: string) => void
  clearRole: () => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('stakeholder')
  const [backendUrl, setBackendUrl] = useState('http://localhost:8502')

  const clearRole = useCallback(() => {
    setRole(null)
  }, [])

  return (
    <RoleContext.Provider value={{
      role,
      setRole,
      viewMode,
      setViewMode,
      backendUrl,
      setBackendUrl,
      clearRole
    }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}
