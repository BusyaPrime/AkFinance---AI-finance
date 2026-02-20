import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './locales/ru'
import en from './locales/en'

i18n.use(initReactI18next).init({
    resources: { ru, en },
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
    ns: ['common', 'auth', 'dashboard', 'transactions', 'budgets', 'categories', 'reports', 'settings', 'errors', 'nav'],
    defaultNS: 'common',
})

export default i18n
