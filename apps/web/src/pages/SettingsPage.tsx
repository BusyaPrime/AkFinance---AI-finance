import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/api/client'
import type { PreferenceRequest } from '@/api/types'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { Sun, Moon, LogOut } from 'lucide-react'

export default function SettingsPage() {
    const { t, i18n } = useTranslation('settings')
    const { theme, setTheme } = useTheme()
    const { logout } = useAuth()
    const qc = useQueryClient()

    const updatePref = useMutation({
        mutationFn: (data: PreferenceRequest) => api.put('/me/preferences', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['preferences'] }); toast.success(t('saved')) },
    })

    const changeLang = (lang: string) => {
        i18n.changeLanguage(lang)
        updatePref.mutate({ locale: lang === 'ru' ? 'ru-RU' : 'en-US' })
    }

    const changeTheme = (t: 'light' | 'dark') => {
        setTheme(t)
        updatePref.mutate({ theme: t === 'dark' ? 'DARK' : 'LIGHT' })
    }

    const changeCurrency = (cur: string) => {
        updatePref.mutate({ defaultCurrency: cur })
    }

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            <h1 className="text-h2">{t('title')}</h1>

            <div className="p-6 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="text-h3 mb-4">{t('language')}</h3>
                <div className="flex gap-2">
                    {[{ code: 'ru', label: 'Русский' }, { code: 'en', label: 'English' }].map(l => (
                        <button key={l.code} onClick={() => changeLang(l.code)}
                            className="px-4 py-2 rounded-xl text-small font-semibold cursor-pointer transition-micro"
                            style={{
                                background: i18n.language === l.code ? 'var(--color-gold)' : 'var(--color-surface-2)',
                                color: i18n.language === l.code ? '#fff' : 'var(--color-text-muted)',
                            }}>
                            {l.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="text-h3 mb-4">{t('theme')}</h3>
                <div className="flex gap-2">
                    <button onClick={() => changeTheme('light')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-small font-semibold cursor-pointer transition-micro"
                        style={{
                            background: theme === 'light' ? 'var(--color-gold)' : 'var(--color-surface-2)',
                            color: theme === 'light' ? '#fff' : 'var(--color-text-muted)',
                        }}>
                        <Sun size={16} /> {t('themeLight')}
                    </button>
                    <button onClick={() => changeTheme('dark')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-small font-semibold cursor-pointer transition-micro"
                        style={{
                            background: theme === 'dark' ? 'var(--color-gold)' : 'var(--color-surface-2)',
                            color: theme === 'dark' ? '#fff' : 'var(--color-text-muted)',
                        }}>
                        <Moon size={16} /> {t('themeDark')}
                    </button>
                </div>
            </div>

            <div className="p-6 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="text-h3 mb-4">{t('currency')}</h3>
                <div className="flex gap-2">
                    {['RUB', 'USD', 'EUR'].map(c => (
                        <button key={c} onClick={() => changeCurrency(c)}
                            className="px-4 py-2 rounded-xl text-small font-semibold cursor-pointer transition-micro"
                            style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={logout}
                className="flex items-center gap-3 px-6 py-3 rounded-xl text-body font-semibold transition-micro cursor-pointer w-fit"
                style={{ background: 'rgba(180,35,24,0.1)', color: 'var(--color-danger)' }}>
                <LogOut size={20} /> {t('logout')}
            </button>
        </div>
    )
}
