import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import TransactionsPage from '@/pages/TransactionsPage'
import BudgetsPage from '@/pages/BudgetsPage'
import CategoriesPage from '@/pages/CategoriesPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import CalculatorPage from '@/pages/CalculatorPage'
import MarketsPage from '@/pages/MarketsPage'
import AiChatWidget from '@/components/AiChatWidget'
import ProfilePage from '@/pages/ProfilePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()
    if (isAuthenticated) return <Navigate to="/" replace />
    return <>{children}</>
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

                    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                        <Route index element={<DashboardPage />} />
                        <Route path="transactions" element={<TransactionsPage />} />
                        <Route path="budgets" element={<BudgetsPage />} />
                        <Route path="categories" element={<CategoriesPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="calculator" element={<CalculatorPage />} />
                        <Route path="markets" element={<MarketsPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
            <AiChatWidget />
        </ThemeProvider>
    )
}
