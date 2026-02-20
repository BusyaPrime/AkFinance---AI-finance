import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

const SYSTEM_PROMPT = `Ты — профессиональный финансовый советник и инвестиционный аналитик. 
Ты помогаешь пользователям принимать умные финансовые решения.
Отвечай на русском языке. Будь конкретным, давай практические советы.
Когда говоришь о рисках инвестиций — обязательно их упоминай.
Используй числа, проценты, конкретные примеры там где возможно.
Твои ответы должны быть структурированными, но не слишком длинными (до 200 слов).
Ты умеешь анализировать: акции, криптовалюты, ETF, недвижимость, депозиты, облигации.`

const QUICK_PROMPTS = [
    'Куда вложить 100 000 ₽?',
    'Стоит ли покупать Bitcoin сейчас?',
    'Как защитить деньги от инфляции?',
    'Что такое диверсификация?',
]

export default function AiChatWidget() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: '👋 Привет! Я — AI финансовый советник. Спроси меня про инвестиции, крипту, акции или как лучше распорядиться деньгами.' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [open, messages])

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return

        const userMsg: Message = { role: 'user', content: text }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: text }
                    ],
                    max_tokens: 500,
                    temperature: 0.7,
                }),
            })

            if (!response.ok) throw new Error('API error')
            const data = await response.json()
            const reply = data.choices[0].message.content

            setMessages(prev => [...prev, { role: 'assistant', content: reply }])
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Ошибка соединения с AI. Проверьте ключ API или попробуйте позже.'
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all"
                style={{
                    background: open ? 'var(--color-danger, #ef4444)' : 'linear-gradient(135deg, var(--color-gold), #d4a853)',
                    color: '#fff',
                    boxShadow: open
                        ? '0 8px 24px rgba(239,68,68,0.4)'
                        : '0 8px 24px rgba(194,166,95,0.45)',
                    transform: open ? 'rotate(0deg)' : 'rotate(0deg)',
                }}>
                {open ? <X size={22} /> : (
                    <div className="relative">
                        <MessageCircle size={24} fill="rgba(255,255,255,0.2)" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
                    </div>
                )}
            </button>

            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-3xl overflow-hidden flex flex-col"
                    style={{
                        height: '520px',
                        background: 'var(--color-surface)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
                        border: '1px solid var(--color-border)',
                    }}>

                    <div className="px-5 py-4 flex items-center gap-3"
                        style={{ background: 'linear-gradient(135deg, rgba(194,166,95,0.15), rgba(194,166,95,0.05))', borderBottom: '1px solid var(--color-border)' }}>
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, var(--color-gold), #d4a853)' }}>
                            <Sparkles size={20} color="#1a1a1a" />
                        </div>
                        <div>
                            <p className="text-small font-bold" style={{ color: 'var(--color-text)' }}>AI Финсоветник</p>
                            <p className="text-caption flex items-center gap-1.5" style={{ color: '#22c55e' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                                Онлайн · GPT-4o mini
                            </p>
                        </div>
                        <button onClick={() => setMessages([messages[0]])}
                            className="ml-auto text-caption cursor-pointer px-3 py-1 rounded-xl transition-all"
                            style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-2)' }}>
                            Очистить
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                    style={{
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, var(--color-gold), #d4a853)'
                                            : 'var(--color-surface-2)',
                                    }}>
                                    {msg.role === 'user'
                                        ? <User size={14} color="#1a1a1a" />
                                        : <Bot size={14} style={{ color: 'var(--color-gold)' }} />}
                                </div>
                                <div className="max-w-[82%] px-3.5 py-2.5 rounded-2xl text-small leading-relaxed"
                                    style={{
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, var(--color-gold), #d4a853)'
                                            : 'var(--color-surface-2)',
                                        color: msg.role === 'user' ? '#1a1a1a' : 'var(--color-text)',
                                        borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                        whiteSpace: 'pre-wrap',
                                    }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-surface-2)' }}>
                                    <Bot size={14} style={{ color: 'var(--color-gold)' }} />
                                </div>
                                <div className="px-4 py-3 rounded-2xl flex items-center gap-2" style={{ background: 'var(--color-surface-2)' }}>
                                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-gold)' }} />
                                    <span className="text-small" style={{ color: 'var(--color-text-muted)' }}>Думаю...</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {messages.length <= 1 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-2">
                            {QUICK_PROMPTS.map(q => (
                                <button key={q} onClick={() => sendMessage(q)}
                                    className="px-3 py-1.5 rounded-xl text-caption font-semibold cursor-pointer transition-all"
                                    style={{
                                        background: 'var(--color-surface-2)',
                                        color: 'var(--color-text-muted)',
                                        border: '1px solid var(--color-border)',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget.style.borderColor = 'var(--color-gold)')
                                            ; (e.currentTarget.style.color = 'var(--color-gold)')
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget.style.borderColor = 'var(--color-border)')
                                            ; (e.currentTarget.style.color = 'var(--color-text-muted)')
                                    }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="px-4 py-3 flex gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                            placeholder="Спросить совет..."
                            className="flex-1 h-11 px-4 rounded-xl text-small outline-none"
                            style={{
                                background: 'var(--color-surface-2)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-border)',
                            }}
                        />
                        <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                            className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all disabled:opacity-40"
                            style={{ background: 'linear-gradient(135deg, var(--color-gold), #d4a853)', color: '#1a1a1a' }}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
