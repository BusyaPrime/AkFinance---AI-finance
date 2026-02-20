import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown, Search, Star, RefreshCw, ChevronLeft } from 'lucide-react'

interface CoinItem {
    id: string
    symbol: string
    name: string
    image: string
    current_price: number
    price_change_percentage_24h: number
    market_cap: number
    total_volume: number
}

interface ChartPoint { time: string; price: number }

const fmtPrice = (n: number) => n >= 1
    ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
    : `$${n.toFixed(6)}`

const fmtCap = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    return `$${n.toFixed(0)}`
}

const PERIOD_OPTIONS = [
    { label: '24ч', days: 1 },
    { label: '7д', days: 7 },
    { label: '30д', days: 30 },
    { label: '1г', days: 365 },
]

const TOP_COINS = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple',
    'cardano', 'avalanche-2', 'polkadot', 'chainlink', 'toncoin',
    'dogecoin', 'shiba-inu', 'litecoin', 'uniswap', 'stellar']

/* ─── Fetch helpers ─── */
const fetchCoins = async (): Promise<CoinItem[]> => {
    const r = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${TOP_COINS.join(',')}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`
    )
    if (!r.ok) throw new Error('CoinGecko error')
    return r.json()
}

const fetchChart = async (coinId: string, days: number): Promise<ChartPoint[]> => {
    const r = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    )
    if (!r.ok) throw new Error('Chart error')
    const data = await r.json()
    const prices: [number, number][] = data.prices
    const step = Math.max(1, Math.floor(prices.length / 80))
    return prices
        .filter((_, i) => i % step === 0)
        .map(([ts, price]) => ({
            time: days <= 1
                ? new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                : new Date(ts).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
            price: +price.toFixed(price >= 1 ? 2 : 6)
        }))
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="px-3 py-2 rounded-xl text-small font-semibold"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            <div style={{ color: 'var(--color-text-muted)' }}>{label}</div>
            <div style={{ color: 'var(--color-gold)' }}>{fmtPrice(payload[0].value)}</div>
        </div>
    )
}

function CoinDetail({ coin, onBack }: { coin: CoinItem; onBack: () => void }) {
    const [period, setPeriod] = useState(7)
    const isUp = coin.price_change_percentage_24h >= 0

    const { data: chart, isLoading } = useQuery({
        queryKey: ['chart', coin.id, period],
        queryFn: () => fetchChart(coin.id, period),
        staleTime: 60_000,
    })

    const chartColor = isUp ? '#22c55e' : '#ef4444'

    return (
        <div>
            <button onClick={onBack}
                className="flex items-center gap-2 mb-6 text-small font-semibold cursor-pointer transition-all"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                <ChevronLeft size={18} /> Назад к рынкам
            </button>

            <div className="flex items-center gap-4 mb-6">
                <img src={coin.image} alt={coin.name} className="w-14 h-14 rounded-full" />
                <div>
                    <h1 className="text-h2 font-bold" style={{ color: 'var(--color-text)' }}>{coin.name}</h1>
                    <span className="text-small uppercase font-semibold" style={{ color: 'var(--color-text-muted)' }}>{coin.symbol}</span>
                </div>
                <div className="ml-auto text-right">
                    <p className="text-h2 font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{fmtPrice(coin.current_price)}</p>
                    <span className="flex items-center gap-1 justify-end text-small font-semibold"
                        style={{ color: isUp ? '#22c55e' : '#ef4444' }}>
                        {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}% за 24ч
                    </span>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                {PERIOD_OPTIONS.map(o => (
                    <button key={o.days} onClick={() => setPeriod(o.days)}
                        className="px-4 py-2 rounded-xl text-small font-semibold cursor-pointer transition-all"
                        style={{
                            background: period === o.days ? chartColor : 'var(--color-surface)',
                            color: period === o.days ? '#fff' : 'var(--color-text-muted)',
                            border: '1px solid var(--color-border)',
                        }}>
                        {o.label}
                    </button>
                ))}
            </div>

            <div className="p-5 rounded-2xl border mb-6" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={chart}>
                            <defs>
                                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                                interval="preserveStartEnd" axisLine={false} tickLine={false} />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                                tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                                axisLine={false} tickLine={false} width={60} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="price" stroke={chartColor} strokeWidth={2}
                                fill="url(#priceGrad)" dot={false} activeDot={{ r: 5, fill: chartColor }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                    { label: 'Рыночная кап.', value: fmtCap(coin.market_cap) },
                    { label: 'Объём торгов (24ч)', value: fmtCap(coin.total_volume) },
                    { label: 'Тикер', value: coin.symbol.toUpperCase() },
                ].map(s => (
                    <div key={s.label} className="p-4 rounded-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <p className="text-caption mb-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                        <p className="text-body font-bold" style={{ color: 'var(--color-text)' }}>{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function MarketsPage() {
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<CoinItem | null>(null)
    const [watched, setWatched] = useState<string[]>(['bitcoin', 'ethereum', 'solana'])

    const { data: coins, isLoading, refetch, dataUpdatedAt } = useQuery({
        queryKey: ['markets'],
        queryFn: fetchCoins,
        refetchInterval: 30_000,
        staleTime: 25_000,
    })

    const toggleWatch = (id: string) =>
        setWatched(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id])

    const filtered = coins?.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
    )

    if (selected) return <CoinDetail coin={selected} onBack={() => setSelected(null)} />

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-h2" style={{ color: 'var(--color-text)' }}>Рынки</h1>
                    <p className="text-small mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        Обновлено: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('ru-RU') : '—'}
                    </p>
                </div>
                <button onClick={() => refetch()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-small font-semibold cursor-pointer transition-all"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={16} /> Обновить
                </button>
            </div>

            {coins && watched.length > 0 && (
                <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
                    {coins.filter(c => watched.includes(c.id)).map(c => {
                        const up = c.price_change_percentage_24h >= 0
                        return (
                            <button key={c.id} onClick={() => setSelected(c)}
                                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl cursor-pointer transition-all shrink-0"
                                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                <img src={c.image} alt={c.name} className="w-7 h-7 rounded-full" />
                                <div className="text-left">
                                    <p className="text-caption font-bold" style={{ color: 'var(--color-text)' }}>{c.symbol.toUpperCase()}</p>
                                    <p className="text-caption tabular-nums" style={{ color: up ? '#22c55e' : '#ef4444' }}>
                                        {up ? '+' : ''}{c.price_change_percentage_24h.toFixed(2)}%
                                    </p>
                                </div>
                                <p className="text-small font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
                                    {fmtPrice(c.current_price)}
                                </p>
                            </button>
                        )
                    })}
                </div>
            )}

            <div className="relative mb-4">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Поиск монеты..."
                    className="w-full h-12 pl-11 pr-4 rounded-xl border text-small outline-none"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }} />
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="hidden md:grid px-4 py-3 text-caption font-semibold"
                    style={{ gridTemplateColumns: '2rem 2.5rem 1fr 140px 120px 120px 2.5rem', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                    <span>#</span><span></span><span>Монета</span>
                    <span className="text-right">Цена</span>
                    <span className="text-right">24ч %</span>
                    <span className="text-right">Кап.</span>
                    <span></span>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                        <RefreshCw size={24} className="animate-spin mx-auto mb-2" /> Загрузка данных...
                    </div>
                ) : filtered?.map((coin, idx) => {
                    const isUp = coin.price_change_percentage_24h >= 0
                    const isWatched = watched.includes(coin.id)
                    return (
                        <div key={coin.id}
                            className="grid items-center px-4 py-3.5 cursor-pointer group transition-all"
                            style={{
                                gridTemplateColumns: '2rem 2.5rem 1fr 140px 120px 120px 2.5rem',
                                borderTop: idx > 0 ? '1px solid var(--color-border)' : 'none',
                            }}
                            onClick={() => setSelected(coin)}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                            <span className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</span>
                            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                            <div>
                                <p className="text-small font-bold" style={{ color: 'var(--color-text)' }}>{coin.name}</p>
                                <p className="text-caption uppercase" style={{ color: 'var(--color-text-muted)' }}>{coin.symbol}</p>
                            </div>
                            <p className="text-right text-small font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>
                                {fmtPrice(coin.current_price)}
                            </p>
                            <div className="flex items-center justify-end gap-1" style={{ color: isUp ? '#22c55e' : '#ef4444' }}>
                                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                <span className="text-small font-semibold tabular-nums">
                                    {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                                </span>
                            </div>
                            <p className="text-right text-small tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                                {fmtCap(coin.market_cap)}
                            </p>
                            <button onClick={e => { e.stopPropagation(); toggleWatch(coin.id) }}
                                className="p-1.5 rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                                style={{ color: isWatched ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
                                <Star size={16} fill={isWatched ? 'var(--color-gold)' : 'none'} />
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
