-- V3__create_budgets_preferences.sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year BETWEEN 2000 AND 2100),
    limit_amount DECIMAL(14,2) NOT NULL CHECK (limit_amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'RUB',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, category_id, month, year)
);

CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, year, month);

CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL DEFAULT 'ru-RU',
    theme VARCHAR(10) NOT NULL DEFAULT 'LIGHT' CHECK (theme IN ('LIGHT', 'DARK')),
    default_currency VARCHAR(3) NOT NULL DEFAULT 'RUB'
);
