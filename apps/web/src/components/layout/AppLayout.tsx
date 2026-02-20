import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import {
    LayoutDashboard, ArrowLeftRight, PiggyBank, Tag,
    BarChart3, Settings, Sun, Moon, Calculator, TrendingUp
} from 'lucide-react'

const navItems = [
    { key: 'dashboard', path: '/', icon: LayoutDashboard },
    { key: 'transactions', path: '/transactions', icon: ArrowLeftRight },
    { key: 'markets', path: '/markets', icon: TrendingUp },
    { key: 'budgets', path: '/budgets', icon: PiggyBank },
    { key: 'categories', path: '/categories', icon: Tag },
    { key: 'reports', path: '/reports', icon: BarChart3 },
    { key: 'calculator', path: '/calculator', icon: Calculator },
    { key: 'settings', path: '/settings', icon: Settings },
]

export default function AppLayout() {
    const { t } = useTranslation()
    const { theme, toggleTheme } = useTheme()
    const { user } = useAuth()
    const avatar = localStorage.getItem('ak_avatar')
    const displayName = localStorage.getItem('ak_name') || user?.email?.split('@')[0] || 'User'
    const initials = (user?.email || 'U').slice(0, 2).toUpperCase()

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
            <aside className="hidden md:flex flex-col w-64 border-r p-6 gap-2"
                style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                }}>
                <div className="text-h2 mb-8 px-3" style={{ color: 'var(--color-gold)' }}>
                    AkFinance
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    {navItems.map(({ key, path, icon: Icon }) => (
                        <NavLink
                            key={key}
                            to={path}
                            end={path === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-small transition-micro ${isActive ? 'font-semibold' : ''
                                }`
                            }
                            style={({ isActive }) => ({
                                background: isActive ? 'var(--color-surface-2)' : 'transparent',
                                color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)',
                            })}
                        >
                            <Icon size={20} />
                            {t(`nav:${key}`)}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex flex-col gap-2 mt-auto">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-small transition-micro cursor-pointer"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        {theme === 'light' ? t('settings:themeDark') : t('settings:themeLight')}
                    </button>

                    <NavLink to="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-micro cursor-pointer"
                        style={({ isActive }) => ({
                            background: isActive ? 'var(--color-surface-2)' : 'transparent',
                        })}>
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-caption font-bold shrink-0"
                            style={{ background: avatar ? 'transparent' : 'linear-gradient(135deg, var(--color-gold), #d4a853)', color: '#1a1a1a' }}>
                            {avatar
                                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                                : initials
                            }
                        </div>
                        <div className="min-w-0">
                            <p className="text-small font-semibold truncate" style={{ color: 'var(--color-text)' }}>{displayName}</p>
                            <p className="text-caption truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
                        </div>
                    </NavLink>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-h-screen">
                <header className="h-16 flex items-center justify-between px-6 border-b md:px-8"
                    style={{
                        background: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                    }}>
                    <h1 className="text-h3 md:hidden" style={{ color: 'var(--color-gold)' }}>
                        AkFinance
                    </h1>
                    <div className="hidden md:block" />
                    <button onClick={toggleTheme} className="md:hidden p-2 rounded-xl transition-micro cursor-pointer"
                        style={{ color: 'var(--color-text-muted)' }}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </header>

                <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </div>

                <nav className="md:hidden flex items-center justify-around h-16 border-t"
                    style={{
                        background: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                    }}>
                    {navItems.slice(0, 5).map(({ key, path, icon: Icon }) => (
                        <NavLink
                            key={key}
                            to={path}
                            end={path === '/'}
                            className="flex flex-col items-center gap-0.5 py-1 px-2"
                            style={({ isActive }) => ({
                                color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)',
                            })}
                        >
                            <Icon size={20} />
                            <span className="text-caption">{t(`nav:${key}`)}</span>
                        </NavLink>
                    ))}
                </nav>
            </main>
        </div>
    )
}
