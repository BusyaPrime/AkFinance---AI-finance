import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Camera, User, Mail, Shield, Pencil, Check, LogOut } from 'lucide-react'
import { toast } from 'sonner'

function getInitials(email: string) {
    return email.split('@')[0].slice(0, 2).toUpperCase()
}

function getAvatarColor(email: string) {
    const colors = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)',
        'linear-gradient(135deg, var(--color-gold), #d4a853)',
    ]
    const idx = email.charCodeAt(0) % colors.length
    return colors[idx]
}

export default function ProfilePage() {
    const { user, logout } = useAuth()
    const [avatar, setAvatar] = useState<string | null>(() => localStorage.getItem('ak_avatar'))
    const [editName, setEditName] = useState(false)
    const [name, setName] = useState(() => localStorage.getItem('ak_name') || user?.name || '')
    const fileRef = useRef<HTMLInputElement>(null)

    const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Файл слишком большой. Максимум 2MB')
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result as string
            setAvatar(base64)
            localStorage.setItem('ak_avatar', base64)
            toast.success('Фото обновлено')
        }
        reader.readAsDataURL(file)
    }, [])

    const saveName = () => {
        localStorage.setItem('ak_name', name)
        setEditName(false)
        toast.success('Имя сохранено')
    }

    const email = user?.email || 'user@example.com'
    const displayName = name || email.split('@')[0]

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-h2 mb-6" style={{ color: 'var(--color-text)' }}>Профиль</h1>

            <div className="p-8 rounded-3xl border mb-4 flex flex-col items-center text-center"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

                <div className="relative mb-5">
                    <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center text-h2 font-bold select-none"
                        style={{
                            background: avatar ? 'transparent' : getAvatarColor(email),
                            color: '#fff',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        }}>
                        {avatar
                            ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                            : getInitials(email)
                        }
                    </div>
                    <button onClick={() => fileRef.current?.click()}
                        className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-gold), #d4a853)',
                            color: '#1a1a1a',
                            boxShadow: '0 4px 12px rgba(194,166,95,0.4)',
                        }}>
                        <Camera size={16} />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                <div className="flex items-center gap-2 mb-1">
                    {editName ? (
                        <>
                            <input value={name} onChange={e => setName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && saveName()}
                                autoFocus
                                placeholder="Введите имя..."
                                className="h-10 px-4 rounded-xl border text-h3 font-bold text-center outline-none"
                                style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-gold)', color: 'var(--color-text)', minWidth: '200px' }} />
                            <button onClick={saveName}
                                className="p-2 rounded-xl cursor-pointer"
                                style={{ background: 'var(--color-gold)', color: '#1a1a1a' }}>
                                <Check size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-h2 font-bold" style={{ color: 'var(--color-text)' }}>{displayName}</h2>
                            <button onClick={() => setEditName(true)}
                                className="p-1.5 rounded-lg cursor-pointer transition-all"
                                style={{ color: 'var(--color-text-muted)' }}>
                                <Pencil size={15} />
                            </button>
                        </>
                    )}
                </div>

                <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>{email}</p>
                {avatar && (
                    <button onClick={() => { setAvatar(null); localStorage.removeItem('ak_avatar') }}
                        className="mt-3 text-caption cursor-pointer transition-all"
                        style={{ color: 'var(--color-text-muted)' }}>
                        Удалить фото
                    </button>
                )}
            </div>

            <div className="space-y-3 mb-4">
                {[
                    { icon: <Mail size={18} />, label: 'Email', value: email, color: '#60a5fa' },
                    { icon: <User size={18} />, label: 'Имя пользователя', value: displayName, color: 'var(--color-gold)' },
                    { icon: <Shield size={18} />, label: 'Статус аккаунта', value: 'Активен', color: '#22c55e' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-4 p-4 rounded-2xl"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: item.color + '18', color: item.color }}>
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-caption" style={{ color: 'var(--color-text-muted)' }}>{item.label}</p>
                            <p className="text-small font-semibold" style={{ color: 'var(--color-text)' }}>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={logout}
                className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-small font-semibold cursor-pointer transition-all"
                style={{
                    background: 'rgba(239,68,68,0.08)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.2)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}>
                <LogOut size={18} />
                Выйти из аккаунта
            </button>
        </div>
    )
}
