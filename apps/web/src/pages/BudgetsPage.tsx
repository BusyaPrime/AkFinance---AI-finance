import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/api/client'
import type { BudgetResponse, BudgetRequest, CategoryResponse } from '@/api/types'
import { LoadingSkeleton, ErrorBlock, EmptyState } from '@/components/shared/UiStates'
import { Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'

const budgetSchema = z.object({
    categoryId: z.string().min(1),
    limitAmount: z.preprocess(v => Number(v), z.number().min(0.01)),
})
type BForm = z.infer<typeof budgetSchema>

export default function BudgetsPage() {
    const { t, i18n } = useTranslation('budgets')
    const qc = useQueryClient()
    const now = new Date()
    const [month, setMonth] = useState(now.getMonth() + 1)
    const [year, setYear] = useState(now.getFullYear())
    const [showModal, setShowModal] = useState(false)

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['budgets', month, year],
        queryFn: () => api.get<BudgetResponse[]>('/budgets', { month, year }),
    })
    const { data: cats } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get<CategoryResponse[]>('/categories', { type: 'EXPENSE' }),
    })
    const { register, handleSubmit, reset, formState: { errors } } = useForm<BForm>({ resolver: zodResolver(budgetSchema) as any })

    const create = useMutation({
        mutationFn: (d: BudgetRequest) => api.post('/budgets', d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success(t('saved')); setShowModal(false); reset() },
    })
    const remove = useMutation({
        mutationFn: (id: string) => api.del(`/budgets/${id}`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success(t('deleted')) },
    })

    const prevM = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
    const nextM = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

    const fmt = (v: number) => new Intl.NumberFormat(i18n.language === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v)
    const monthName = new Intl.DateTimeFormat(i18n.language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long' }).format(new Date(2026, month - 1))

    const onSubmit = (d: BForm) => {
        create.mutate({ categoryId: d.categoryId, month, year, limitAmount: d.limitAmount })
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-h2">{t('title')}</h1>
                <button onClick={() => { reset(); setShowModal(true) }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-small font-semibold transition-micro cursor-pointer"
                    style={{ background: 'var(--color-gold)', color: '#fff' }}>
                    <Plus size={18} /> {t('add')}
                </button>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={prevM} className="p-2 rounded-xl cursor-pointer" style={{ background: 'var(--color-surface-2)' }}><ChevronLeft size={18} /></button>
                <span className="text-body font-semibold min-w-[140px] text-center capitalize">{monthName} {year}</span>
                <button onClick={nextM} className="p-2 rounded-xl cursor-pointer" style={{ background: 'var(--color-surface-2)' }}><ChevronRight size={18} /></button>
            </div>

            {isLoading ? <LoadingSkeleton /> : isError ? <ErrorBlock onRetry={refetch} /> :
                !data?.length ? <EmptyState title={t('empty')} subtitle={t('emptyHint')} /> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.map(b => (
                            <div key={b.id} className="p-6 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-body font-semibold">{b.category.name}</h3>
                                        <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                                            {fmt(b.spentAmount)} / {fmt(b.limitAmount)}
                                        </span>
                                    </div>
                                    <button onClick={() => remove.mutate(b.id)} className="p-2 rounded-xl cursor-pointer" style={{ color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                                </div>
                                <div className="relative w-24 h-24 mx-auto">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-surface-2)" strokeWidth="8" />
                                        <circle cx="50" cy="50" r="42" fill="none"
                                            stroke={b.progressPercent >= 100 ? 'var(--color-danger)' : b.progressPercent >= 80 ? 'var(--color-warning)' : 'var(--color-gold)'}
                                            strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray={`${Math.min(b.progressPercent, 100) * 2.64} 264`} />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-small font-semibold">
                                        {Math.round(b.progressPercent)}%
                                    </span>
                                </div>
                                {b.progressPercent >= 100 && <p className="text-caption text-center mt-2" style={{ color: 'var(--color-danger)' }}>{t('overLimit')}</p>}
                                {b.progressPercent >= 80 && b.progressPercent < 100 && <p className="text-caption text-center mt-2" style={{ color: 'var(--color-warning)' }}>{t('warning')}</p>}
                            </div>
                        ))}
                    </div>
                )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="w-full max-w-md p-6 rounded-3xl" style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-h3">{t('add')}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl cursor-pointer" style={{ color: 'var(--color-text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <select {...register('categoryId')} className="h-12 px-4 rounded-xl border text-body outline-none cursor-pointer"
                                style={{ background: 'var(--color-surface-2)', borderColor: errors.categoryId ? 'var(--color-danger)' : 'var(--color-border)', color: 'var(--color-text)' }}>
                                <option value="">— {t('common:filter', { ns: 'common' })} —</option>
                                {cats?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <input {...register('limitAmount')} type="number" step="0.01" placeholder={t('limit')}
                                className="h-12 px-4 rounded-xl border text-body outline-none"
                                style={{ background: 'var(--color-surface-2)', borderColor: errors.limitAmount ? 'var(--color-danger)' : 'var(--color-border)', color: 'var(--color-text)' }} />
                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-12 rounded-xl font-semibold cursor-pointer" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>{t('common:cancel', { ns: 'common' })}</button>
                                <button type="submit" className="flex-1 h-12 rounded-xl font-semibold cursor-pointer" style={{ background: 'var(--color-gold)', color: '#fff' }}>{t('common:save', { ns: 'common' })}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
