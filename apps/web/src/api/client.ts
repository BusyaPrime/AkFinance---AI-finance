import type { ErrorResponse } from './types'

const API_BASE = '/api/v1'

class ApiError extends Error {
    status: number
    errorBody: ErrorResponse | null

    constructor(status: number, message: string, errorBody: ErrorResponse | null = null) {
        super(message)
        this.status = status
        this.errorBody = errorBody
        this.name = 'ApiError'
    }
}

function getToken(): string | null {
    return localStorage.getItem('ak_token')
}

function setToken(token: string): void {
    localStorage.setItem('ak_token', token)
}

function clearToken(): void {
    localStorage.removeItem('ak_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        let errorBody: ErrorResponse | null = null
        try {
            errorBody = await response.json()
        } catch {
            // ignore parse error
        }

        if (response.status === 401) {
            clearToken()
            window.location.href = '/login'
        }

        throw new ApiError(
            response.status,
            errorBody?.message || `HTTP ${response.status}`,
            errorBody,
        )
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json()
}

function get<T>(path: string, params?: Record<string, string | number | undefined | null>): Promise<T> {
    let url = path
    if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value))
            }
        })
        const qs = searchParams.toString()
        if (qs) url += `?${qs}`
    }
    return request<T>(url)
}

function post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

function put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
}

function del<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
}

export const api = { get, post, put, del, setToken, clearToken, getToken }
export { ApiError }
