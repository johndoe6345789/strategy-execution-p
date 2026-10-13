-- Migration: 001_pdca_schema
-- Domain: pdca
-- Plan-Do-Check-Act continuous improvement cycles.
-- The four phases are stored as JSONB columns so each
-- phase's notes/findings stay co-located with the cycle.

CREATE TABLE pdca_cycles (
    id                  UUID PRIMARY KEY
                            DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL
                            REFERENCES users(id)
                            ON DELETE CASCADE,
    title               TEXT NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    category            TEXT NOT NULL DEFAULT 'quality'
                            CHECK (category IN (
                                'quality', 'cost',
                                'delivery', 'safety',
                                'morale'
                            )),
    current_phase       TEXT NOT NULL DEFAULT 'plan'
                            CHECK (current_phase IN (
                                'plan', 'do',
                                'check', 'act'
                            )),
    status              TEXT NOT NULL DEFAULT 'on-track'
                            CHECK (status IN (
                                'not-started', 'on-track',
                                'at-risk', 'blocked',
                                'completed'
                            )),
    owner               TEXT NOT NULL DEFAULT '',
    start_date          DATE NOT NULL DEFAULT CURRENT_DATE,
    plan_phase          JSONB NOT NULL DEFAULT
                            '{"completed":false,"notes":"",
                              "findings":""}',
    do_phase            JSONB NOT NULL DEFAULT
                            '{"completed":false,"notes":"",
                              "findings":""}',
    check_phase         JSONB NOT NULL DEFAULT
                            '{"completed":false,"notes":"",
                              "findings":""}',
    act_phase           JSONB NOT NULL DEFAULT
                            '{"completed":false,"notes":"",
                              "findings":""}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pdca_user
    ON pdca_cycles (user_id, status);
