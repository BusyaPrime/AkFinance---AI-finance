import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeContextType {
    theme: ThemeMode
    toggleTheme: () => void
    setTheme: (t: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>(() => {
        const stored = localStorage.getItem('ak_theme')
        if (stored === 'dark' || stored === 'light') return stored
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        localStorage.setItem('ak_theme', theme)
    }, [theme])

    const toggleTheme = () => setThemeState(t => t === 'light' ? 'dark' : 'light')
    const setTheme = (t: ThemeMode) => setThemeState(t)

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
}
