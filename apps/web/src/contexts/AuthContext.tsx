import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '@/api/client'

interface User {
    email: string
    name?: string
}

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    login: (token: string, email?: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function parseJwt(token: string): any {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(base64))
    } catch {
        return null
    }
}

function getUserFromToken(): User | null {
    const token = api.getToken()
    if (!token) return null
    // First try stored email (more reliable than JWT sub which is userId)
    const storedEmail = localStorage.getItem('ak_email')
    if (storedEmail) return { email: storedEmail }
    // Fallback: try JWT payload
    const payload = parseJwt(token)
    if (!payload) return null
    const sub = payload.sub || payload.email || ''
    // If sub looks like UUID (userId), not email
    const isEmail = sub.includes('@')
    return { email: isEmail ? sub : (storedEmail || 'Пользователь') }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!api.getToken())
    const [user, setUser] = useState<User | null>(getUserFromToken)

    useEffect(() => {
        const token = api.getToken()
        setIsAuthenticated(!!token)
        setUser(getUserFromToken())
    }, [])

    const login = (token: string, email?: string) => {
        api.setToken(token)
        if (email) localStorage.setItem('ak_email', email)
        setIsAuthenticated(true)
        setUser(email ? { email } : getUserFromToken())
    }

    const logout = () => {
        api.clearToken()
        localStorage.removeItem('ak_email')
        setIsAuthenticated(false)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
