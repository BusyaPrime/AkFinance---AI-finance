import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/api/client'
import type { CategoryResponse, CategoryRequest, CategoryType } from '@/api/types'
import { LoadingSkeleton, ErrorBlock, EmptyState } from '@/components/shared/UiStates'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const catSchema = z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['INCOME', 'EXPENSE']),
    icon: z.string().optional(),
    color: z.string().optional(),
})
type CatForm = z.infer<typeof catSchema>

const ICONS = ['🍔', '🏠', '🚗', '💼', '🎮', '👕', '💊', '📱', '✈️', '🎓', '💰', '📈', '🎁', '🛒', '⚡']
const COLORS = ['#C7A76C', '#1F7A4D', '#B42318', '#B7791F', '#5E5A54', '#2563EB', '#7C3AED', '#EC4899']

export default function CategoriesPage() {
    const { t } = useTranslation('categories')
    const qc = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const [editCat, setEditCat] = useState<CategoryResponse | null>(null)
    const [tab, setTab] = useState<CategoryType>('EXPENSE')

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get<CategoryResponse[]>('/categories'),
    })
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CatForm>({
        resolver: zodResolver(catSchema),
    })
    const selectedIcon = watch('icon')
    const selectedColor = watch('color')

    const save = useMutation({
        mutationFn: (p: { id?: string; data: CategoryRequest }) =>
            p.id ? api.put(`/categories/${p.id}`, p.data) : api.post('/categories', p.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success(t('saved')); close() },
    })
    const remove = useMutation({
        mutationFn: (id: string) => api.del(`/categories/${id}`),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success(t('deleted')) },
    })

    const open = (c?: CategoryResponse) => {
        setEditCat(c || null)
        reset(c ? { name: c.name, type: c.type, icon: c.icon || '', color: c.color || '' } : { name: '', type: tab, icon: '', color: '' })
        setShowModal(true)
    }
    const close = () => { setShowModal(false); setEditCat(null); reset() }

    const onSubmit = (d: CatForm) => {
        save.mutate({ id: editCat?.id, data: { name: d.name, type: d.type, icon: d.icon, color: d.color } })
    }

    const filtered = data?.filter(c => c.type === tab) || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-h2">{t('title')}</h1>
                <button onClick={() => open()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-small font-semibold transition-micro cursor-pointer"
                    style={{ background: 'var(--color-gold)', color: '#fff' }}>
                    <Plus size={18} /> {t('add')}
                </button>
            </div>

            <div className="flex gap-2">
                {(['EXPENSE', 'INCOME'] as const).map(type => (
                    <button key={type} onClick={() => setTab(type)}
                        className="px-4 py-2 rounded-xl text-small font-semibold transition-micro cursor-pointer"
                        style={{
                            background: tab === type ? 'var(--color-gold)' : 'var(--color-surface-2)',
                            color: tab === type ? '#fff' : 'var(--color-text-muted)',
                        }}>
                        {type === 'EXPENSE' ? t('expenseType') : t('incomeType')}
                    </button>
                ))}
            </div>

            {isLoading ? <LoadingSkeleton /> : isError ? <ErrorBlock onRetry={refetch} /> :
                !filtered.length ? <EmptyState title={t('empty')} subtitle={t('emptyHint')} /> : (
                    <div className="flex flex-col gap-2">
                        {filtered.map(c => (
                            <div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl border transition-micro"
                                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                    style={{ background: c.color ? `${c.color}22` : 'var(--color-surface-2)' }}>
                                    {c.icon || '📁'}
                                </div>
                                <span className="flex-1 text-body font-semibold">{c.name}</span>
                                <button onClick={() => open(c)} className="p-2 rounded-xl cursor-pointer"
                                    style={{ color: 'var(--color-text-muted)' }}><Pencil size={16} /></button>
                                <button onClick={() => remove.mutate(c.id)} className="p-2 rounded-xl cursor-pointer"
                                    style={{ color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="w-full max-w-lg p-6 rounded-3xl" style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-h3">{editCat ? t('edit') : t('add')}</h2>
                            <button onClick={close} className="p-2 rounded-xl cursor-pointer" style={{ color: 'var(--color-text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <input {...register('name')} placeholder={t('name')}
                                className="h-12 px-4 rounded-xl border text-body outline-none"
                                style={{ background: 'var(--color-surface-2)', borderColor: errors.name ? 'var(--color-danger)' : 'var(--color-border)', color: 'var(--color-text)' }} />
                            <select {...register('type')} className="h-12 px-4 rounded-xl border text-body outline-none cursor-pointer"
                                style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                                <option value="EXPENSE">{t('expenseType')}</option>
                                <option value="INCOME">{t('incomeType')}</option>
                            </select>
                            <div className="flex flex-wrap gap-2">
                                {ICONS.map(i => (
                                    <button type="button" key={i} onClick={() => setValue('icon', i)}
                                        className="w-10 h-10 rounded-xl text-lg flex items-center justify-center cursor-pointer"
                                        style={{ background: selectedIcon === i ? 'var(--color-gold)' : 'var(--color-surface-2)' }}>{i}</button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(c => (
                                    <button type="button" key={c} onClick={() => setValue('color', c)}
                                        className="w-8 h-8 rounded-full cursor-pointer" style={{ background: c, border: selectedColor === c ? '3px solid var(--color-text)' : '3px solid transparent' }} />
                                ))}
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={close} className="flex-1 h-12 rounded-xl font-semibold cursor-pointer" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>{t('common:cancel', { ns: 'common' })}</button>
                                <button type="submit" className="flex-1 h-12 rounded-xl font-semibold cursor-pointer" style={{ background: 'var(--color-gold)', color: '#fff' }}>{t('common:save', { ns: 'common' })}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
