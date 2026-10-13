-- Migration: 001_kpi_schema
-- Domain: kpi
-- KPI scorecard: user-defined metrics across four
-- strategic categories with baseline/target tracking.

CREATE TABLE kpi_metrics (
    id          UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL
                    CHECK (category IN (
                        'financial', 'operational',
                        'customer', 'strategic'
                    )),
    baseline    NUMERIC(15, 4) NOT NULL DEFAULT 0,
    current_val NUMERIC(15, 4) NOT NULL DEFAULT 0,
    target_val  NUMERIC(15, 4) NOT NULL DEFAULT 0,
    unit        TEXT NOT NULL DEFAULT '',
    frequency   TEXT NOT NULL DEFAULT 'monthly'
                    CHECK (frequency IN (
                        'daily', 'weekly', 'monthly',
                        'quarterly', 'annual'
                    )),
    owner       TEXT NOT NULL DEFAULT '',
    trend       TEXT NOT NULL DEFAULT 'flat'
                    CHECK (trend IN (
                        'up', 'down', 'flat'
                    )),
    status      TEXT NOT NULL DEFAULT 'on-track'
                    CHECK (status IN (
                        'on-track', 'at-risk', 'off-track'
                    )),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kpi_user_cat
    ON kpi_metrics (user_id, category);
