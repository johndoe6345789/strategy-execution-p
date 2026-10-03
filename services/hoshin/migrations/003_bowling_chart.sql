-- Migration: 003_bowling_chart
-- Domain: hoshin
-- Hoshin Kanri bowling chart: monthly status tracking
-- per objective.

CREATE TABLE bowling_objectives (
    id          UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,
    title       TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bowling_obj_user
    ON bowling_objectives (user_id);

CREATE TABLE bowling_months (
    id           UUID PRIMARY KEY
                     DEFAULT gen_random_uuid(),
    objective_id UUID NOT NULL
                     REFERENCES bowling_objectives(id)
                     ON DELETE CASCADE,
    month        SMALLINT NOT NULL
                     CHECK (month BETWEEN 1 AND 12),
    year         SMALLINT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'not-started'
                     CHECK (status IN (
                         'not-started', 'in-progress',
                         'achieved', 'missed'
                     )),
    actual       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    target       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (objective_id, year, month)
);

CREATE INDEX idx_bowling_months_obj
    ON bowling_months (objective_id);
