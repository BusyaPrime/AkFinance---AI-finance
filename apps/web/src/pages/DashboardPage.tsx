import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import type { DashboardSummary } from '@/api/types'
import { LoadingSkeleton, ErrorBlock, EmptyState } from '@/components/shared/UiStates'
import { TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight } from 'lucide-react'
import {
    PieChart, Pie, Cell,
    ResponsiveContainer, Tooltip,
} from 'recharts'

const CHART_COLORS = ['#C7A76C', '#B08E4F', '#1F7A4D', '#B7791F', '#B42318', '#5E5A54']

function getMonthName(month: number, locale: string) {
    return new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2026, month - 1))
}

export default function DashboardPage() {
    const { t, i18n } = useTranslation('dashboard')
    const now = new Date()
    const [month, setMonth] = useState(now.getMonth() + 1)
    const [year, setYear] = useState(now.getFullYear())

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['dashboard', month, year],
        queryFn: () => api.get<DashboardSummary>('/dashboard/summary', { month, year }),
    })

    const prevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1) }
        else setMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1) }
        else setMonth(m => m + 1)
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat(i18n.language === 'ru' ? 'ru-RU' : 'en-US', {
            style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
        }).format(val)

    if (isLoading) return <LoadingSkeleton count={6} />
    if (isError) return <ErrorBlock onRetry={refetch} />

    const isEmpty = data && data.totalIncome === 0 && data.totalExpense === 0

    if (isEmpty) {
        return (
            <EmptyState
                title={t('emptyTitle')}
                subtitle={t('emptySubtitle')}
            >
                <a href="/transactions"
                    className="px-8 py-3 rounded-xl text-body font-semibold transition-micro inline-block"
                    style={{ background: 'var(--color-gold)', color: '#fff' }}>
                    {t('emptyCta')}
                </a>
            </EmptyState>
        )
    }

    const pieData = data?.topCategories.map(c => ({ name: c.categoryName, value: c.amount })) || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-h2">{t('title')}</h1>
                <div className="flex items-center gap-3">
                    <button onClick={prevMonth} className="p-2 rounded-xl transition-micro cursor-pointer"
                        style={{ background: 'var(--color-surface-2)' }}>
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-body font-semibold min-w-[140px] text-center capitalize">
                        {getMonthName(month, i18n.language === 'ru' ? 'ru-RU' : 'en-US')} {year}
                    </span>
                    <button onClick={nextMonth} className="p-2 rounded-xl transition-micro cursor-pointer"
                        style={{ background: 'var(--color-surface-2)' }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl border transition-micro"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(199, 167, 108, 0.15)' }}>
                            <Wallet size={20} style={{ color: 'var(--color-gold)' }} />
                        </div>
                        <span className="text-small" style={{ color: 'var(--color-text-muted)' }}>{t('totalBalance')}</span>
                    </div>
                    <div className="text-h1" style={{ color: 'var(--color-gold)' }}>
                        {formatCurrency(data?.balance || 0)}
                    </div>
                </div>


                <div className="p-6 rounded-2xl border transition-micro"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(31, 122, 77, 0.15)' }}>
                            <TrendingUp size={20} style={{ color: 'var(--color-success)' }} />
                        </div>
                        <span className="text-small" style={{ color: 'var(--color-text-muted)' }}>{t('income')}</span>
                    </div>
                    <div className="text-h2" style={{ color: 'var(--color-success)' }}>
                        {formatCurrency(data?.totalIncome || 0)}
                    </div>
                </div>


                <div className="p-6 rounded-2xl border transition-micro"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(180, 35, 24, 0.15)' }}>
                            <TrendingDown size={20} style={{ color: 'var(--color-danger)' }} />
                        </div>
                        <span className="text-small" style={{ color: 'var(--color-text-muted)' }}>{t('expense')}</span>
                    </div>
                    <div className="text-h2" style={{ color: 'var(--color-danger)' }}>
                        {formatCurrency(data?.totalExpense || 0)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-h3 mb-4">{t('categorySplit')}</h3>
                    {pieData.length === 0 ? (
                        <p className="text-small py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                            {t('emptySubtitle')}
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                                    dataKey="value" nameKey="name" paddingAngle={2}>
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="p-6 rounded-2xl border"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <h3 className="text-h3 mb-4">{t('budgets')}</h3>
                    {!data?.budgets.length ? (
                        <p className="text-small py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                            Нет бюджетов
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {data.budgets.map((b, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-small font-semibold">{b.categoryName}</span>
                                        <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                                            {formatCurrency(b.spentAmount)} / {formatCurrency(b.limitAmount)}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden"
                                        style={{ background: 'var(--color-surface-2)' }}>
                                        <div className="h-full rounded-full transition-modal"
                                            style={{
                                                width: `${Math.min(b.progressPercent, 100)}%`,
                                                background: b.progressPercent >= 100 ? 'var(--color-danger)' :
                                                    b.progressPercent >= 80 ? 'var(--color-warning)' :
                                                        'var(--color-gold)',
                                            }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
