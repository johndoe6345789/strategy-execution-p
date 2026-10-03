-- Migration: 001_okr_schema
-- Domain: okr
-- Objectives and Key Results (OKR) management.
-- Objectives are company/team/individual scoped;
-- Key Results track numeric progress toward each objective.

CREATE TABLE okr_objectives (
    id          UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    owner       TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT 'company'
                    CHECK (category IN (
                        'company', 'team', 'individual'
                    )),
    timeframe   TEXT NOT NULL DEFAULT 'quarterly'
                    CHECK (timeframe IN (
                        'quarterly', 'annual'
                    )),
    quarter     TEXT CHECK (quarter IN (
                    'Q1', 'Q2', 'Q3', 'Q4'
                )),
    year        SMALLINT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN (
                        'active', 'achieved',
                        'at-risk', 'abandoned'
                    )),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_okr_obj_user
    ON okr_objectives (user_id, status);

CREATE TABLE okr_key_results (
    id             UUID PRIMARY KEY
                       DEFAULT gen_random_uuid(),
    objective_id   UUID NOT NULL
                       REFERENCES okr_objectives(id)
                       ON DELETE CASCADE,
    description    TEXT NOT NULL,
    start_value    NUMERIC(15, 4) NOT NULL DEFAULT 0,
    current_value  NUMERIC(15, 4) NOT NULL DEFAULT 0,
    target_value   NUMERIC(15, 4) NOT NULL DEFAULT 0,
    unit           TEXT NOT NULL DEFAULT '',
    progress       NUMERIC(5, 2) NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'on-track'
                       CHECK (status IN (
                           'on-track', 'at-risk',
                           'behind', 'achieved'
                       )),
    last_updated   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_okr_kr_obj
    ON okr_key_results (objective_id);
