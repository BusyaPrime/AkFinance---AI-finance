import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import type { DashboardSummary } from '@/api/types'
import { LoadingSkeleton, ErrorBlock } from '@/components/shared/UiStates'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
    BarChart, Bar, ResponsiveContainer,
    XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'

export default function ReportsPage() {
    const { t, i18n } = useTranslation('reports')
    const now = new Date()
    const [month, setMonth] = useState(now.getMonth() + 1)
    const [year, setYear] = useState(now.getFullYear())

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['dashboard', month, year],
        queryFn: () => api.get<DashboardSummary>('/dashboard/summary', { month, year }),
    })

    const prevM = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
    const nextM = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }
    const fmt = (v: number) => new Intl.NumberFormat(i18n.language === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v)
    const monthName = new Intl.DateTimeFormat(i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long' }).format(new Date(2026, month - 1))

    if (isLoading) return <LoadingSkeleton count={4} />
    if (isError) return <ErrorBlock onRetry={refetch} />

    const incExpData = [
        { name: t('incomeVsExpense'), income: data?.totalIncome || 0, expense: data?.totalExpense || 0 },
    ]
    const catData = data?.topCategories.map(c => ({ name: c.categoryName, amount: c.amount })) || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-h2">{t('title')}</h1>
                <div className="flex items-center gap-3">
                    <button onClick={prevM} className="p-2 rounded-xl cursor-pointer" style={{ background: 'var(--color-surface-2)' }}><ChevronLeft size={18} /></button>
                    <span className="text-body font-semibold min-w-[140px] text-center capitalize">{monthName} {year}</span>
                    <button onClick={nextM} className="p-2 rounded-xl cursor-pointer" style={{ background: 'var(--color-surface-2)' }}><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-h3 mb-4">{t('incomeVsExpense')}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={incExpData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                            <Tooltip formatter={(v) => fmt(v as number)} />
                            <Bar dataKey="income" fill="var(--color-success)" radius={[8, 8, 0, 0]} name={t('incomeVsExpense').split(' vs ')[0]} />
                            <Bar dataKey="expense" fill="var(--color-danger)" radius={[8, 8, 0, 0]} name={t('incomeVsExpense').split(' vs ')[1]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="p-6 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-h3 mb-4">{t('spendingByCategory')}</h3>
                    {catData.length === 0 ?
                        <p className="text-small py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>Нет данных</p> : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={catData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis type="number" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                                    <Tooltip formatter={(v) => fmt(v as number)} />
                                    <Bar dataKey="amount" fill="var(--color-gold)" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                </div>
            </div>

            <div className="p-6 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="text-h3 mb-4">{t('topCategories')}</h3>
                {catData.length === 0 ?
                    <p className="text-small text-center" style={{ color: 'var(--color-text-muted)' }}>Нет данных</p> : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-caption" style={{ color: 'var(--color-text-muted)' }}>
                                    <th className="pb-3 font-semibold">Категория</th>
                                    <th className="pb-3 font-semibold text-right">Сумма</th>
                                </tr>
                            </thead>
                            <tbody>
                                {catData.map((c, i) => (
                                    <tr key={i} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                                        <td className="py-3 text-body">{c.name}</td>
                                        <td className="py-3 text-body text-right font-semibold">{fmt(c.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
            </div>
        </div>
    )
}
