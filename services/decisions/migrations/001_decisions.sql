-- Migration: decisions domain
-- TODO (v2): add startup_id FK once D23 entity exists.

CREATE TABLE decisions (
    id          UUID PRIMARY KEY
                DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    context     TEXT NOT NULL DEFAULT '',
    options_considered TEXT NOT NULL DEFAULT '',
    decision    TEXT NOT NULL DEFAULT '',
    rationale   TEXT NOT NULL DEFAULT '',
    planner_step_id TEXT NOT NULL DEFAULT '',
    outcome     TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_decisions_user
    ON decisions(user_id, created_at DESC);
