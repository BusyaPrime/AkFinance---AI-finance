/* ===== API Types (mirrors backend DTOs) ===== */

export interface AuthResponse {
    accessToken: string
    expiresIn: number
}

export interface RegisterRequest {
    email: string
    password: string
}

export interface LoginRequest {
    email: string
    password: string
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'
export type CategoryType = 'INCOME' | 'EXPENSE'
export type Theme = 'LIGHT' | 'DARK'

export interface CategoryResponse {
    id: string
    name: string
    type: CategoryType
    icon: string | null
    color: string | null
}

export interface CategoryRequest {
    name: string
    type: CategoryType
    icon?: string
    color?: string
}

export interface TransactionResponse {
    id: string
    type: TransactionType
    amount: number
    currency: string
    occurredAt: string
    category: CategoryResponse | null
    note: string | null
    createdAt: string
    updatedAt: string
}

export interface TransactionRequest {
    type: TransactionType
    amount: number
    currency?: string
    occurredAt: string
    categoryId?: string
    note?: string
}

export interface BudgetResponse {
    id: string
    category: CategoryResponse
    month: number
    year: number
    limitAmount: number
    spentAmount: number
    currency: string
    progressPercent: number
}

export interface BudgetRequest {
    categoryId: string
    month: number
    year: number
    limitAmount: number
    currency?: string
}

export interface DashboardSummary {
    totalIncome: number
    totalExpense: number
    balance: number
    topCategories: CategoryBreakdown[]
    budgets: BudgetPreview[]
}

export interface CategoryBreakdown {
    categoryId: string
    categoryName: string
    amount: number
}

export interface BudgetPreview {
    categoryName: string
    limitAmount: number
    spentAmount: number
    progressPercent: number
}

export interface PreferenceResponse {
    locale: string
    theme: Theme
    defaultCurrency: string
}

export interface PreferenceRequest {
    locale?: string
    theme?: Theme
    defaultCurrency?: string
}

export interface ErrorResponse {
    timestamp: string
    status: number
    error: string
    message: string
    details?: FieldError[]
    requestId?: string
}

export interface FieldError {
    field: string
    code: string
    message: string
}

export interface Page<T> {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
    size: number
    first: boolean
    last: boolean
}
