import { useState, useMemo } from 'react'
import {
    TrendingUp, Home, CreditCard, BarChart3,
    Plus, Trash2, Calculator
} from 'lucide-react'

interface BalanceRow {
    id: number
    label: string
    type: 'income' | 'expense'
    amount: number
    category: string
}

const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

const pmt = (rate: number, nper: number, pv: number): number => {
    if (rate === 0) return pv / nper
    return (pv * rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1)
}

const TABS = [
    { id: 'balance', label: 'Таблица доходов', icon: <BarChart3 size={18} /> },
    { id: 'mortgage', label: 'Ипотека', icon: <Home size={18} /> },
    { id: 'credit', label: 'Кредит', icon: <CreditCard size={18} /> },
    { id: 'invest', label: 'Инвестиции', icon: <TrendingUp size={18} /> },
]

export default function CalculatorPage() {
    const [tab, setTab] = useState('balance')

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-h2 flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--color-gold), #d4a853)', color: '#1a1a1a' }}>
                        <Calculator size={22} />
                    </div>
                    Финансовый калькулятор
                </h1>
                <p className="text-small mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Планируй бюджет, рассчитывай кредиты, прогнозируй инвестиции
                </p>
            </div>

            <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: 'var(--color-surface)' }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-small font-semibold transition-all cursor-pointer"
                        style={{
                            background: tab === t.id ? 'var(--color-surface-2)' : 'transparent',
                            color: tab === t.id ? 'var(--color-gold)' : 'var(--color-text-muted)',
                            boxShadow: tab === t.id ? 'var(--shadow-sm, 0 1px 4px rgba(0,0,0,.15))' : 'none',
                        }}>
                        {t.icon}
                        <span className="hidden sm:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            {tab === 'balance' && <BalanceSheet />}
            {tab === 'mortgage' && <MortgageCalc />}
            {tab === 'credit' && <CreditCalc />}
            {tab === 'invest' && <InvestCalc />}
        </div>
    )
}

function BalanceSheet() {
    const [currentBalance, setCurrentBalance] = useState(0)
    const [rows, setRows] = useState<BalanceRow[]>([
        { id: 1, label: 'Зарплата', type: 'income', amount: 80000, category: 'Работа' },
        { id: 2, label: 'Аренда квартиры', type: 'expense', amount: 25000, category: 'Жильё' },
        { id: 3, label: 'Продукты', type: 'expense', amount: 15000, category: 'Еда' },
        { id: 4, label: 'Транспорт', type: 'expense', amount: 5000, category: 'Транспорт' },
    ])
    const [newLabel, setNewLabel] = useState('')
    const [newType, setNewType] = useState<'income' | 'expense'>('expense')
    const [newAmount, setNewAmount] = useState('')
    const [newCategory, setNewCategory] = useState('')

    const stats = useMemo(() => {
        const income = rows.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
        const expense = rows.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
        return { income, expense, net: income - expense, total: currentBalance + income - expense }
    }, [rows, currentBalance])

    const addRow = () => {
        if (!newLabel || !newAmount) return
        setRows(prev => [...prev, {
            id: Date.now(), label: newLabel, type: newType,
            amount: parseFloat(newAmount) || 0, category: newCategory
        }])
        setNewLabel(''); setNewAmount(''); setNewCategory('')
    }

    const updateRow = (id: number, field: keyof BalanceRow, value: string | number) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
    }

    const deleteRow = (id: number) => setRows(prev => prev.filter(r => r.id !== id))

    // Running balance
    const rowsWithBalance = useMemo(() => {
        let running = currentBalance
        return rows.map(r => {
            if (r.type === 'income') running += r.amount
            else running -= r.amount
            return { ...r, runningBalance: running }
        })
    }, [rows, currentBalance])

    return (
        <div className="space-y-6">
            <div className="p-5 rounded-2xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <label className="text-small font-semibold mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                    💰 Текущий баланс (сколько у вас денег сейчас)
                </label>
                <div className="flex items-center gap-3">
                    <input type="number" value={currentBalance || ''}
                        onChange={e => setCurrentBalance(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="flex-1 h-14 px-5 rounded-xl border text-h3 font-bold outline-none"
                        style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-gold)' }} />
                    <span className="text-h3 font-bold" style={{ color: 'var(--color-text-muted)' }}>₽</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Нач. баланс', value: currentBalance, color: 'var(--color-gold)' },
                    { label: 'Доходы', value: stats.income, color: '#22c55e' },
                    { label: 'Расходы', value: stats.expense, color: '#ef4444' },
                    { label: 'Итого', value: stats.total, color: stats.total >= 0 ? '#22c55e' : '#ef4444' },
                ].map((s, i) => (
                    <div key={i} className="p-4 rounded-2xl text-center" style={{ background: 'var(--color-surface)', border: `1px solid ${s.color}22` }}>
                        <p className="text-caption mb-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                        <p className="text-body font-bold tabular-nums" style={{ color: s.color }}>{fmt(s.value)} ₽</p>
                    </div>
                ))}
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="grid px-4 py-3 text-caption font-semibold"
                    style={{ gridTemplateColumns: '1fr 100px 130px 130px 130px 40px', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                    <div>Описание</div>
                    <div>Тип</div>
                    <div>Категория</div>
                    <div className="text-right">Сумма</div>
                    <div className="text-right">Баланс после</div>
                    <div></div>
                </div>

                {rowsWithBalance.map((row) => (
                    <div key={row.id} className="grid items-center px-4 py-2.5 group"
                        style={{
                            gridTemplateColumns: '1fr 100px 130px 130px 130px 40px',
                            borderTop: '1px solid var(--color-border)',
                        }}>
                        <input value={row.label} onChange={e => updateRow(row.id, 'label', e.target.value)}
                            className="h-9 px-3 rounded-lg border-0 outline-none text-small w-full"
                            style={{ background: 'transparent', color: 'var(--color-text)' }} />

                        <select value={row.type} onChange={e => updateRow(row.id, 'type', e.target.value)}
                            className="h-9 px-2 rounded-lg text-caption outline-none cursor-pointer"
                            style={{
                                background: row.type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                color: row.type === 'income' ? '#22c55e' : '#ef4444',
                                border: 'none',
                            }}>
                            <option value="income">Доход</option>
                            <option value="expense">Расход</option>
                        </select>

                        <input value={row.category} onChange={e => updateRow(row.id, 'category', e.target.value)}
                            placeholder="Категория"
                            className="h-9 px-3 rounded-lg text-small outline-none"
                            style={{ background: 'var(--color-surface-2)', border: 'none', color: 'var(--color-text-muted)' }} />

                        <input type="number" value={row.amount || ''}
                            onChange={e => updateRow(row.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="h-9 px-3 rounded-lg text-small font-bold text-right outline-none"
                            style={{
                                background: 'var(--color-surface-2)', border: 'none',
                                color: row.type === 'income' ? '#22c55e' : '#ef4444',
                            }} />

                        <div className="text-right text-small font-bold tabular-nums pr-1"
                            style={{ color: row.runningBalance >= 0 ? 'var(--color-text)' : '#ef4444' }}>
                            {fmt(row.runningBalance)} ₽
                        </div>

                        <button onClick={() => deleteRow(row.id)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            style={{ color: '#ef4444' }}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}

                <div className="grid items-center px-4 py-2.5" style={{
                    gridTemplateColumns: '1fr 100px 130px 130px 130px 40px',
                    borderTop: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)',
                }}>
                    <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                        placeholder="Новая строка..."
                        onKeyDown={e => e.key === 'Enter' && addRow()}
                        className="h-9 px-3 rounded-lg text-small outline-none"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />

                    <select value={newType} onChange={e => setNewType(e.target.value as any)}
                        className="h-9 px-2 rounded-lg text-caption outline-none cursor-pointer"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                        <option value="income">Доход</option>
                        <option value="expense">Расход</option>
                    </select>

                    <input value={newCategory} onChange={e => setNewCategory(e.target.value)}
                        placeholder="Категория"
                        className="h-9 px-3 rounded-lg text-small outline-none"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />

                    <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)}
                        placeholder="0"
                        className="h-9 px-3 rounded-lg text-small text-right outline-none"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />

                    <div />

                    <button onClick={addRow}
                        className="p-1.5 rounded-lg cursor-pointer transition-all"
                        style={{ background: 'var(--color-gold)', color: '#1a1a1a' }}>
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4 rounded-2xl text-center" style={{
                background: stats.net >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${stats.net >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
                <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>Ежемесячная остаточная прибыль</p>
                <p className="text-h2 font-bold tabular-nums" style={{ color: stats.net >= 0 ? '#22c55e' : '#ef4444' }}>
                    {stats.net >= 0 ? '+' : ''}{fmt(stats.net)} ₽
                </p>
            </div>
        </div>
    )
}

function MortgageCalc() {
    const [price, setPrice] = useState(5000000)
    const [down, setDown] = useState(1000000)
    const [rate, setRate] = useState(12)
    const [years, setYears] = useState(20)

    const calc = useMemo(() => {
        const principal = price - down
        const monthlyRate = rate / 100 / 12
        const months = years * 12
        const payment = pmt(monthlyRate, months, principal)
        const total = payment * months
        const overpay = total - principal
        return { principal, payment, total, overpay, downPct: (down / price * 100) }
    }, [price, down, rate, years])

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border space-y-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <h2 className="text-h3 font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <Home size={20} style={{ color: 'var(--color-gold)' }} /> Параметры ипотеки
                    </h2>
                    {[
                        { label: 'Стоимость жилья', value: price, set: setPrice, suffix: '₽' },
                        { label: 'Первый взнос', value: down, set: setDown, suffix: '₽' },
                    ].map(f => (
                        <div key={f.label}>
                            <div className="flex justify-between mb-2">
                                <label className="text-small font-semibold" style={{ color: 'var(--color-text-muted)' }}>{f.label}</label>
                                <span className="text-small font-bold" style={{ color: 'var(--color-gold)' }}>{fmt(f.value)} {f.suffix}</span>
                            </div>
                            <input type="range" min={0} max={f.label.includes('Стоимость') ? 50000000 : price}
                                step={50000} value={f.value} onChange={e => f.set(+e.target.value)}
                                className="w-full accent-yellow-500 cursor-pointer" />
                        </div>
                    ))}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-small font-semibold" style={{ color: 'var(--color-text-muted)' }}>Ставка %</label>
                            <span className="text-small font-bold" style={{ color: 'var(--color-gold)' }}>{rate}%</span>
                        </div>
                        <input type="range" min={1} max={30} step={0.1} value={rate}
                            onChange={e => setRate(+e.target.value)} className="w-full accent-yellow-500 cursor-pointer" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-small font-semibold" style={{ color: 'var(--color-text-muted)' }}>Срок</label>
                            <span className="text-small font-bold" style={{ color: 'var(--color-gold)' }}>{years} лет</span>
                        </div>
                        <input type="range" min={1} max={30} step={1} value={years}
                            onChange={e => setYears(+e.target.value)} className="w-full accent-yellow-500 cursor-pointer" />
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        { label: 'Сумма кредита', value: calc.principal, color: 'var(--color-text)' },
                        { label: 'Первый взнос', value: down, suffix: `(${calc.downPct.toFixed(1)}%)`, color: 'var(--color-gold)' },
                        { label: 'Ежемесячный платёж', value: calc.payment, color: '#ef4444', big: true },
                        { label: 'Итого выплат', value: calc.total, color: 'var(--color-text)' },
                        { label: 'Переплата', value: calc.overpay, color: '#ef4444' },
                    ].map(r => (
                        <div key={r.label} className="flex items-center justify-between p-4 rounded-2xl"
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <span className="text-small" style={{ color: 'var(--color-text-muted)' }}>{r.label} {r.suffix || ''}</span>
                            <span className={`font-bold tabular-nums ${r.big ? 'text-h3' : 'text-body'}`} style={{ color: r.color }}>
                                {fmt(r.value)} ₽
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function CreditCalc() {
    const [amount, setAmount] = useState(500000)
    const [rate, setRate] = useState(18)
    const [months, setMonths] = useState(24)

    const calc = useMemo(() => {
        const monthlyRate = rate / 100 / 12
        const payment = pmt(monthlyRate, months, amount)
        const total = payment * months
        const overpay = total - amount

        // Monthly schedule (first 5 + last 1)
        let balance = amount
        const schedule = []
        for (let i = 1; i <= months; i++) {
            const interest = balance * monthlyRate
            const principal = payment - interest
            balance -= principal
            schedule.push({ month: i, payment, principal, interest, balance: Math.max(0, balance) })
        }
        return { payment, total, overpay, schedule }
    }, [amount, rate, months])

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border space-y-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <h2 className="text-h3 font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <CreditCard size={20} style={{ color: 'var(--color-gold)' }} /> Параметры кредита
                    </h2>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-small font-semibold" style={{ color: 'var(--color-text-muted)' }}>Сумма кредита</label>
                            <span className="text-small font-bold" style={{ color: 'var(--color-gold)' }}>{fmt(amount)} ₽</span>
                        </div>
                        <input type="range" min={10000} max={5000000} step={10000} value={amount}
                            onChange={e => setAmount(+e.target.value)} className="w-full accent-yellow-500 cursor-pointer" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-small font-semibold" style={{ color: 'var(--color-text-muted)' }}>Ставка %</label>
                            <span className="text-small font-bold" style={{ color: 'var(--color-gold)' }}>{rate}%</span>
                        </div>
                        <input type="range" min={1} max={50} step={0.5} value={rate}
                            onChange={e => setRate(+e.target.value)} className="w-full accent-yellow-500 cursor-pointer" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-small font-semibold" style={{ color: 'var(--color-text-muted)' }}>Срок</label>
                            <span className="text-small font-bold" style={{ color: 'var(--color-gold)' }}>{months} мес.</span>
                        </div>
                        <input type="range" min={1} max={84} step={1} value={months}
                            onChange={e => setMonths(+e.target.value)} className="w-full accent-yellow-500 cursor-pointer" />
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        { label: 'Ежемесячный платёж', value: calc.payment, color: '#ef4444', big: true },
                        { label: 'Итого выплат', value: calc.total, color: 'var(--color-text)' },
                        { label: 'Переплата', value: calc.overpay, color: '#ef4444' },
                        { label: 'Реальная стоимость', value: calc.overpay / amount * 100, color: 'var(--color-text-muted)', suffix: '%', isPercent: true },
                    ].map(r => (
                        <div key={r.label} className="flex items-center justify-between p-4 rounded-2xl"
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <span className="text-small" style={{ color: 'var(--color-text-muted)' }}>{r.label}</span>
                            <span className={`font-bold tabular-nums ${r.big ? 'text-h3' : 'text-body'}`} style={{ color: r.color }}>
                                {r.isPercent ? `${r.value.toFixed(1)}%` : `${fmt(r.value)} ₽`}
                            </span>
                        </div>
                    ))}

                    <div className="p-4 rounded-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <p className="text-caption font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>График платежей (первые 3 мес.)</p>
                        <div className="space-y-2">
                            {calc.schedule.slice(0, 3).map(row => (
                                <div key={row.month} className="grid text-caption" style={{ gridTemplateColumns: '60px 1fr 1fr 1fr' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Мес. {row.month}</span>
                                    <span style={{ color: '#22c55e' }}>−{fmt(row.principal)}</span>
                                    <span style={{ color: '#ef4444' }}>{fmt(row.interest)} %</span>
                                    <span className="text-right" style={{ color: 'var(--color-text)' }}>{fmt(row.balance)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function InvestCalc() {
    const [initial, setInitial] = useState(100000)
    const [monthly, setMonthly] = useState(10000)
    const [rate, setRate] = useState(15)
    const [years, setYears] = useState(10)
    const [type, setType] = useState<'compound' | 'simple'>('compound')

    const PRESETS = [
        { label: '🏦 Банк. депозит', rate: 12 },
        { label: '📈 Акции (sp500)', rate: 15 },
        { label: '🏠 Недвижимость', rate: 10 },
        { label: '🥇 Золото', rate: 8 },
        { label: '₿ Крипто (риск)', rate: 40 },
    ]

    const calc = useMemo(() => {
        const months = years * 12
        const monthlyRate = rate / 100 / 12

        let balance = initial
        const yearly = []
        for (let y = 1; y <= years; y++) {
            for (let m = 0; m < 12; m++) {
                balance = type === 'compound'
                    ? (balance + monthly) * (1 + monthlyRate)
                    : balance + monthly + balance * monthlyRate
            }
            const invested = initial + monthly * y * 12
            yearly.push({ year: y, balance, invested, profit: balance - invested })
        }
        const invested = initial + monthly * months
        return { final: balance, invested, profit: balance - invested, profitPct: (balance - invested) / invested * 100, yearly }
    }, [initial, monthly, rate, years, type])

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <h2 className="text-h3 font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <TrendingUp size={20} style={{ color: 'var(--color-gold)' }} /> Параметры инвестиций
                    </h2>

                    <div>
                        <label className="text-caption font-semibold mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Быстрый выбор</label>
                        <div className="flex flex-wrap gap-2">
                            {PRESETS.map(p => (
                                <button key={p.label} onClick={() => setRate(p.rate)}
                                    className="px-3 py-1.5 rounded-xl text-caption font-semibold cursor-pointer transition-all"
                                    style={{
                                        background: rate === p.rate ? 'var(--color-gold)' : 'var(--color-surface-2)',
                                        color: rate === p.rate ? '#1a1a1a' : 'var(--color-text-muted)',
                                    }}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {[{ v: 'compound', l: 'Сложный %' }, { v: 'simple', l: 'Простой %' }].map(o => (
                            <button key={o.v} onClick={() => setType(o.v as any)}
                                className="flex-1 py-2 rounded-xl text-small font-semibold cursor-pointer"
                                style={{
                                    background: type === o.v ? 'var(--color-gold)' : 'var(--color-surface-2)',
                                    color: type === o.v ? '#1a1a1a' : 'var(--color-text-muted)',
                                }}>
                                {o.l}
                            </button>
                        ))}
                    </div>

                    {[
                        { label: 'Начальный капитал', value: initial, set: setInitial, min: 0, max: 10000000, step: 10000 },
                        { label: 'Ежемес. пополнение', value: monthly, set: setMonthly, min: 0, max: 500000, step: 1000 },
                    ].map(f => (
                        <div key={f.label}>
                            <div className="flex justify-between mb-2">
                                <label className="text-small font-semibold" style={{ color: 'var(--color-text-muted)' }}>{f.label}</label>
                                <span className="text-small font-bold" style={{ color: 'var(--color-gold)' }}>{fmt(f.value)} ₽</span>
                            </div>
                            <input type="range" min={f.min} max={f.max} step={f.step} value={f.value}
                                onChange={e => f.set(+e.target.value)} className="w-full accent-yellow-500 cursor-pointer" />
                        </div>
                    ))}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-small font-semibold" style={{ color: 'var(--color-text-muted)' }}>Ставка дох. %</label>
                            <span className="text-small font-bold" style={{ color: 'var(--color-gold)' }}>{rate}%</span>
                        </div>
                        <input type="range" min={1} max={100} step={0.5} value={rate}
                            onChange={e => setRate(+e.target.value)} className="w-full accent-yellow-500 cursor-pointer" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-small font-semibold" style={{ color: 'var(--color-text-muted)' }}>Горизонт</label>
                            <span className="text-small font-bold" style={{ color: 'var(--color-gold)' }}>{years} лет</span>
                        </div>
                        <input type="range" min={1} max={40} step={1} value={years}
                            onChange={e => setYears(+e.target.value)} className="w-full accent-yellow-500 cursor-pointer" />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="p-5 rounded-2xl text-center" style={{
                        background: 'linear-gradient(135deg, rgba(194,166,95,0.1), rgba(194,166,95,0.05))',
                        border: '1px solid rgba(194,166,95,0.3)',
                    }}>
                        <p className="text-small mb-1" style={{ color: 'var(--color-text-muted)' }}>Итоговый капитал через {years} лет</p>
                        <p className="text-h1 font-bold tabular-nums" style={{ color: 'var(--color-gold)' }}>{fmt(calc.final)} ₽</p>
                    </div>
                    {[
                        { label: 'Вложено всего', value: calc.invested, color: 'var(--color-text)' },
                        { label: 'Прибыль', value: calc.profit, color: '#22c55e' },
                        { label: 'Доходность', value: calc.profitPct, color: '#22c55e', isPercent: true },
                    ].map(r => (
                        <div key={r.label} className="flex items-center justify-between p-4 rounded-2xl"
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <span className="text-small" style={{ color: 'var(--color-text-muted)' }}>{r.label}</span>
                            <span className="text-body font-bold tabular-nums" style={{ color: r.color }}>
                                {r.isPercent ? `+${r.value.toFixed(1)}%` : `${fmt(r.value)} ₽`}
                            </span>
                        </div>
                    ))}

                    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        <div className="grid px-4 py-2 text-caption font-semibold" style={{ gridTemplateColumns: '60px 1fr 1fr', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                            <span>Год</span><span className="text-right">Вложено</span><span className="text-right">Капитал</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {calc.yearly.map(y => (
                                <div key={y.year} className="grid px-4 py-2 text-small" style={{ gridTemplateColumns: '60px 1fr 1fr', borderTop: '1px solid var(--color-border)' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{y.year}</span>
                                    <span className="text-right tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{fmt(y.invested)}</span>
                                    <span className="text-right tabular-nums font-semibold" style={{ color: y.balance > y.invested ? '#22c55e' : 'var(--color-text)' }}>
                                        {fmt(y.balance)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
