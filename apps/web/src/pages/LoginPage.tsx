import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api, ApiError } from '@/api/client'
import type { AuthResponse } from '@/api/types'
import { useAuth } from '@/contexts/AuthContext'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const { t } = useTranslation('auth')
    const navigate = useNavigate()
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginForm) => {
        setLoading(true)
        try {
            const res = await api.post<AuthResponse>('/auth/login', data)
            login(res.accessToken, data.email)
            navigate('/')
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 401) {
                    setError('root', { message: t('errors.invalidCredentials') })
                } else {
                    toast.error(err.message)
                }
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
            <div className="w-full max-w-md p-8 rounded-3xl" style={{
                background: 'var(--color-surface)',
                boxShadow: 'var(--shadow-md)',
            }}>
                <h1 className="text-h1 text-center mb-2" style={{ color: 'var(--color-gold)' }}>AkFinance</h1>
                <h2 className="text-h3 text-center mb-8" style={{ color: 'var(--color-text-muted)' }}>{t('signIn')}</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {errors.root && (
                        <div className="p-3 rounded-xl text-small" style={{
                            background: 'rgba(180, 35, 24, 0.1)',
                            color: 'var(--color-danger)',
                        }}>
                            {errors.root.message}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-small font-semibold">{t('email')}</label>
                        <input {...register('email')}
                            type="email"
                            className="h-12 px-4 rounded-xl border outline-none transition-micro text-body"
                            style={{
                                background: 'var(--color-surface-2)',
                                borderColor: errors.email ? 'var(--color-danger)' : 'var(--color-border)',
                                color: 'var(--color-text)',
                            }}
                        />
                        {errors.email && <span className="text-caption" style={{ color: 'var(--color-danger)' }}>{t('errors.emailRequired')}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-small font-semibold">{t('password')}</label>
                        <input {...register('password')}
                            type="password"
                            className="h-12 px-4 rounded-xl border outline-none transition-micro text-body"
                            style={{
                                background: 'var(--color-surface-2)',
                                borderColor: errors.password ? 'var(--color-danger)' : 'var(--color-border)',
                                color: 'var(--color-text)',
                            }}
                        />
                        {errors.password && <span className="text-caption" style={{ color: 'var(--color-danger)' }}>{t('errors.passwordRequired')}</span>}
                    </div>

                    <button type="submit" disabled={loading}
                        className="h-12 rounded-xl text-body font-semibold transition-micro cursor-pointer mt-2 disabled:opacity-50"
                        style={{
                            background: 'var(--color-gold)',
                            color: '#fff',
                        }}>
                        {loading ? '...' : t('signIn')}
                    </button>

                    <p className="text-small text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>
                        {t('noAccount')}{' '}
                        <Link to="/register" className="font-semibold" style={{ color: 'var(--color-gold)' }}>
                            {t('registerLink')}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
