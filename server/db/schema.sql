-- PostgreSQL Schema for Render / Neon / Supabase deployment

CREATE TABLE IF NOT EXISTS subscription_groups (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL DEFAULT 'Custom',
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT '₹',
    billing_day INTEGER NOT NULL DEFAULT 1,
    admin_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    payment_details TEXT,
    members JSONB NOT NULL DEFAULT '[]'::jsonb,
    current_payer_index INTEGER NOT NULL DEFAULT 0,
    last_billed_date VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reminder_logs (
    id VARCHAR(64) PRIMARY KEY,
    group_id VARCHAR(64) REFERENCES subscription_groups(id) ON DELETE CASCADE,
    group_name VARCHAR(255) NOT NULL,
    payer_name VARCHAR(255) NOT NULL,
    payer_email VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'SENT',
    cycle_month VARCHAR(50) NOT NULL,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_group_billing_day ON subscription_groups(billing_day);
CREATE INDEX IF NOT EXISTS idx_logs_group_id ON reminder_logs(group_id);

