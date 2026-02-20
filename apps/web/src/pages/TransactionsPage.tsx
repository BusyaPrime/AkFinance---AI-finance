import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/api/client'
import type { TransactionResponse, TransactionRequest, CategoryResponse, Page, TransactionType } from '@/api/types'
import { LoadingSkeleton, ErrorBlock, EmptyState } from '@/components/shared/UiStates'
import {
    Plus, Trash2, X, ChevronLeft, ChevronRight,
    TrendingUp, TrendingDown, ArrowLeftRight, Edit3,
    DollarSign
} from 'lucide-react'

const txSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    amount: z.preprocess(v => Number(v), z.number().min(0.01)),
    occurredAt: z.string().min(1),
    categoryId: z.string().optional(),
    note: z.string().optional(),
})

type TxForm = z.infer<typeof txSchema>

export default function TransactionsPage() {
    const { t } = useTranslation('transactions')
    const qc = useQueryClient()
    const [page, setPage] = useState(0)
    const [filterType, setFilterType] = useState<TransactionType | ''>('')
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editTx, setEditTx] = useState<TransactionResponse | null>(null)

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get<CategoryResponse[]>('/categories'),
    })

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['transactions', page, filterType, search],
        queryFn: () => api.get<Page<TransactionResponse>>('/transactions', {
            page, size: 20,
            type: filterType || undefined,
            q: search || undefined,
        }),
    })

    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<TxForm>({
        resolver: zodResolver(txSchema) as any,
    })

    const watchedType = watch('type')

    const createMutation = useMutation({
        mutationFn: (data: TransactionRequest) => api.post('/transactions', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['transactions'] })
            qc.invalidateQueries({ queryKey: ['dashboard'] })
            toast.success(t('saved'))
            closeModal()
        },
        onError: () => toast.error(t('errors:generic')),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: TransactionRequest }) => api.put(`/transactions/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['transactions'] })
            qc.invalidateQueries({ queryKey: ['dashboard'] })
            toast.success(t('saved'))
            closeModal()
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.del(`/transactions/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['transactions'] })
            qc.invalidateQueries({ queryKey: ['dashboard'] })
            toast.success(t('deleted'))
        },
    })

    const openCreate = () => {
        setEditTx(null)
        reset({ type: 'EXPENSE', amount: undefined as any, occurredAt: new Date().toISOString().slice(0, 16), categoryId: '', note: '' })
        setShowModal(true)
    }

    const openEdit = (tx: TransactionResponse) => {
        setEditTx(tx)
        reset({
            type: tx.type,
            amount: tx.amount,
            occurredAt: tx.occurredAt.slice(0, 16),
            categoryId: tx.category?.id || '',
            note: tx.note || '',
        })
        setShowModal(true)
    }

    const closeModal = () => { setShowModal(false); setEditTx(null) }

    const onSubmit = (formData: TxForm) => {
        const req: TransactionRequest = {
            type: formData.type,
            amount: formData.amount,
            occurredAt: new Date(formData.occurredAt).toISOString(),
            categoryId: formData.categoryId || undefined,
            note: formData.note || undefined,
        }
        if (editTx) {
            updateMutation.mutate({ id: editTx.id, data: req })
        } else {
            createMutation.mutate(req)
        }
    }

    const stats = useMemo(() => {
        if (!data?.content) return { income: 0, expense: 0, balance: 0 }
        const income = data.content.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
        const expense = data.content.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
        return { income, expense, balance: income - expense }
    }, [data])

    const txWithBalance = useMemo(() => {
        if (!data?.content) return []
        const sorted = [...data.content]
        let running = 0
        // Calculate forward from oldest → newest, then reverse for display
        const reversed = [...sorted].reverse()
        const withBal = reversed.map(tx => {
            if (tx.type === 'INCOME') running += tx.amount
            else if (tx.type === 'EXPENSE') running -= tx.amount
            return { ...tx, runningBalance: running }
        })
        return withBal.reverse()
    }, [data])

    const fmt = (n: number) => new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
    const fmtDate = (s: string) => new Date(s).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
    const fmtTime = (s: string) => new Date(s).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

    const typeIcon = (type: TransactionType) => {
        if (type === 'INCOME') return <TrendingUp size={16} />
        if (type === 'EXPENSE') return <TrendingDown size={16} />
        return <ArrowLeftRight size={16} />
    }

    const typeColor = (type: TransactionType) => {
        if (type === 'INCOME') return 'var(--color-success, #22c55e)'
        if (type === 'EXPENSE') return 'var(--color-danger, #ef4444)'
        return 'var(--color-gold)'
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-h2" style={{ color: 'var(--color-text)' }}>{t('title')}</h1>
                    <p className="text-small mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {data ? `${data.totalElements} записей` : '...'}
                    </p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl text-small font-semibold transition-all cursor-pointer"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-gold), #d4a853)',
                        color: '#1a1a1a',
                        boxShadow: '0 4px 14px rgba(194, 166, 95, 0.3)',
                    }}>
                    <Plus size={18} />
                    {t('add')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                    { label: t('income'), value: stats.income, icon: <TrendingUp size={20} />, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                    { label: t('expense'), value: stats.expense, icon: <TrendingDown size={20} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                    { label: 'Баланс', value: stats.balance, icon: <DollarSign size={20} />, color: stats.balance >= 0 ? '#22c55e' : '#ef4444', bg: stats.balance >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' },
                ].map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl border" style={{
                        background: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                    }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                                <p className="text-h3 font-bold" style={{ color: s.color }}>{fmt(s.value)} ₽</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Поиск по заметке..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(0) }}
                    className="flex-1 min-w-48 h-11 px-4 rounded-xl border text-small outline-none transition-all"
                    style={{
                        background: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                    }}
                />
                <select
                    value={filterType}
                    onChange={e => { setFilterType(e.target.value as TransactionType | ''); setPage(0) }}
                    className="h-11 px-4 rounded-xl border text-small outline-none cursor-pointer"
                    style={{
                        background: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                    }}>
                    <option value="">{t('filters.allTypes')}</option>
                    <option value="INCOME">{t('income')}</option>
                    <option value="EXPENSE">{t('expense')}</option>
                    <option value="TRANSFER">{t('transfer')}</option>
                </select>
            </div>

            {isLoading ? <LoadingSkeleton count={5} /> : isError ? (
                <ErrorBlock onRetry={() => refetch()} />
            ) : !data?.content?.length ? (
                <EmptyState title={t('empty')} subtitle={t('emptyHint')} />
            ) : (
                <div className="rounded-2xl border overflow-hidden" style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                }}>
                    <div className="hidden md:grid gap-0" style={{
                        gridTemplateColumns: '50px 1fr 140px 140px 140px 120px 80px',
                        borderBottom: '1px solid var(--color-border)',
                        background: 'var(--color-surface-2)',
                    }}>
                        {['', 'Описание', t('date'), t('amount'), 'Баланс', t('category'), ''].map((h, i) => (
                            <div key={i} className="px-4 py-3 text-caption font-semibold"
                                style={{ color: 'var(--color-text-muted)' }}>{h}</div>
                        ))}
                    </div>

                    {txWithBalance.map((tx, idx) => (
                        <div key={tx.id} className="group grid items-center gap-0 transition-all"
                            style={{
                                gridTemplateColumns: '50px 1fr 140px 140px 140px 120px 80px',
                                borderBottom: idx < txWithBalance.length - 1 ? '1px solid var(--color-border)' : 'none',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                            <div className="px-4 py-3.5 flex justify-center">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{
                                        background: tx.type === 'INCOME' ? 'rgba(34,197,94,0.15)' : tx.type === 'EXPENSE' ? 'rgba(239,68,68,0.15)' : 'rgba(194,166,95,0.15)',
                                        color: typeColor(tx.type),
                                    }}>
                                    {typeIcon(tx.type)}
                                </div>
                            </div>

                            <div className="px-4 py-3.5 min-w-0">
                                <p className="text-small font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                    {tx.note || (tx.type === 'INCOME' ? t('income') : tx.type === 'EXPENSE' ? t('expense') : t('transfer'))}
                                </p>
                                <p className="text-caption truncate" style={{ color: 'var(--color-text-muted)' }}>
                                    {tx.category?.name || '—'}
                                </p>
                            </div>

                            <div className="px-4 py-3.5">
                                <p className="text-small" style={{ color: 'var(--color-text)' }}>{fmtDate(tx.occurredAt)}</p>
                                <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{fmtTime(tx.occurredAt)}</p>
                            </div>

                            <div className="px-4 py-3.5">
                                <p className="text-small font-bold tabular-nums" style={{ color: typeColor(tx.type) }}>
                                    {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '−' : ''}{fmt(tx.amount)} ₽
                                </p>
                            </div>

                            <div className="px-4 py-3.5">
                                <p className="text-small font-semibold tabular-nums" style={{
                                    color: tx.runningBalance >= 0 ? 'var(--color-text)' : 'var(--color-danger, #ef4444)',
                                }}>
                                    {fmt(tx.runningBalance)} ₽
                                </p>
                            </div>

                            <div className="px-4 py-3.5">
                                {tx.category && (
                                    <span className="inline-block px-2.5 py-1 rounded-lg text-caption font-medium"
                                        style={{
                                            background: (tx.category.color || 'var(--color-gold)') + '22',
                                            color: tx.category.color || 'var(--color-gold)',
                                        }}>
                                        {tx.category.name}
                                    </span>
                                )}
                            </div>

                            <div className="px-4 py-3.5 flex items-center gap-1">
                                <button onClick={() => openEdit(tx)}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                    style={{ color: 'var(--color-text-muted)' }}>
                                    <Edit3 size={15} />
                                </button>
                                <button onClick={() => { if (confirm('Удалить?')) deleteMutation.mutate(tx.id) }}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                    style={{ color: 'var(--color-danger)' }}>
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>
                                Стр. {data.number + 1} из {data.totalPages}
                            </span>
                            <div className="flex gap-1">
                                <button disabled={data.first} onClick={() => setPage(p => p - 1)}
                                    className="p-2 rounded-lg transition-all cursor-pointer disabled:opacity-30"
                                    style={{ color: 'var(--color-text-muted)' }}>
                                    <ChevronLeft size={18} />
                                </button>
                                <button disabled={data.last} onClick={() => setPage(p => p + 1)}
                                    className="p-2 rounded-lg transition-all cursor-pointer disabled:opacity-30"
                                    style={{ color: 'var(--color-text-muted)' }}>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-md rounded-3xl p-6" style={{
                        background: 'var(--color-surface)',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                    }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-h3" style={{ color: 'var(--color-text)' }}>
                                {editTx ? t('edit') : t('add')}
                            </h2>
                            <button onClick={closeModal}
                                className="p-2 rounded-xl transition-all cursor-pointer"
                                style={{ color: 'var(--color-text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ background: 'var(--color-surface-2)' }}>
                                {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map(typ => (
                                    <label key={typ} className="relative">
                                        <input type="radio" value={typ} {...register('type')} className="sr-only" />
                                        <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-caption font-semibold cursor-pointer transition-all"
                                            style={{
                                                background: watchedType === typ ? 'var(--color-surface)' : 'transparent',
                                                color: watchedType === typ ? typeColor(typ) : 'var(--color-text-muted)',
                                                boxShadow: watchedType === typ ? 'var(--shadow-sm)' : 'none',
                                            }}>
                                            {typeIcon(typ)}
                                            {typ === 'INCOME' ? t('income') : typ === 'EXPENSE' ? t('expense') : t('transfer')}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div>
                                <label className="text-caption font-semibold mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>{t('amount')}</label>
                                <div className="relative">
                                    <input {...register('amount')} type="number" step="0.01" placeholder="0.00"
                                        className="w-full h-12 pl-4 pr-10 rounded-xl border text-body font-bold outline-none transition-all"
                                        style={{
                                            background: 'var(--color-surface-2)',
                                            borderColor: errors.amount ? 'var(--color-danger)' : 'var(--color-border)',
                                            color: 'var(--color-text)',
                                            fontSize: '1.25rem',
                                        }} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-body font-bold" style={{ color: 'var(--color-text-muted)' }}>₽</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-caption font-semibold mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>{t('date')}</label>
                                <input {...register('occurredAt')} type="datetime-local"
                                    className="w-full h-12 px-4 rounded-xl border text-small outline-none transition-all"
                                    style={{
                                        background: 'var(--color-surface-2)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text)',
                                    }} />
                            </div>

                            <div>
                                <label className="text-caption font-semibold mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>{t('category')}</label>
                                <select {...register('categoryId')}
                                    className="w-full h-12 px-4 rounded-xl border text-small outline-none cursor-pointer"
                                    style={{
                                        background: 'var(--color-surface-2)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text)',
                                    }}>
                                    <option value="">— Без категории —</option>
                                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-caption font-semibold mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>{t('note')}</label>
                                <input {...register('note')} placeholder="Комментарий..."
                                    className="w-full h-12 px-4 rounded-xl border text-small outline-none transition-all"
                                    style={{
                                        background: 'var(--color-surface-2)',
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text)',
                                    }} />
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 h-12 rounded-xl font-semibold cursor-pointer transition-all"
                                    style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
                                    {t('common:cancel')}
                                </button>
                                <button type="submit"
                                    className="flex-1 h-12 rounded-xl font-semibold cursor-pointer transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-gold), #d4a853)',
                                        color: '#1a1a1a',
                                        boxShadow: '0 4px 14px rgba(194, 166, 95, 0.3)',
                                    }}>
                                    {t('common:save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
