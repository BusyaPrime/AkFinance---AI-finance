import { useTranslation } from 'react-i18next'

interface EmptyStateProps {
    title?: string
    subtitle?: string
    children?: React.ReactNode
}

export function EmptyState({ title, subtitle, children }: EmptyStateProps) {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full mb-6 flex items-center justify-center"
                style={{ background: 'var(--color-surface-2)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: 'var(--color-text-muted)' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <h3 className="text-h3 mb-2">{title || t('common:noData')}</h3>
            {subtitle && <p className="text-body mb-6" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
            {children}
        </div>
    )
}

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="flex flex-col gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl h-20"
                    style={{ background: 'var(--color-surface-2)' }} />
            ))}
        </div>
    )
}

interface ErrorBlockProps {
    message?: string
    onRetry?: () => void
}

export function ErrorBlock({ message, onRetry }: ErrorBlockProps) {
    const { t } = useTranslation()
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full mb-6 flex items-center justify-center"
                style={{ background: 'rgba(180, 35, 24, 0.1)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: 'var(--color-danger)' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            </div>
            <p className="text-body mb-4" style={{ color: 'var(--color-danger)' }}>
                {message || t('errors:generic')}
            </p>
            {onRetry && (
                <button onClick={onRetry}
                    className="px-6 py-2.5 rounded-xl text-small font-semibold transition-micro cursor-pointer"
                    style={{
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-text)',
                    }}>
                    {t('common:retry')}
                </button>
            )}
        </div>
    )
}
