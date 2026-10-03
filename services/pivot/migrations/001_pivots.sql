-- Migration: pivot domain
CREATE TABLE pivots (
    id              UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,
    original_idea   TEXT NOT NULL,
    new_direction   TEXT NOT NULL,
    trigger_event   TEXT NOT NULL DEFAULT '',
    rationale       TEXT NOT NULL DEFAULT '',
    plan_impact     TEXT NOT NULL DEFAULT '',
    pivoted_at      DATE NOT NULL
                    DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL
                    DEFAULT NOW()
);
CREATE INDEX idx_pivots_user
    ON pivots(user_id, pivoted_at DESC);
