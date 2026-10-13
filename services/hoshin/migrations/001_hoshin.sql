-- Migration: 001_hoshin
-- Domain: hoshin
-- Creates the Hoshin Kanri strategy tables:
--   hoshin_objectives — Vision / Breakthrough / Annual
--   hoshin_links      — Objective ↔ Startup connections

CREATE TABLE hoshin_objectives (
    id          UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    horizon     TEXT NOT NULL DEFAULT 'annual'
                CHECK (horizon IN (
                    'vision',
                    'breakthrough',
                    'annual'
                )),
    target_date DATE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hoshin_obj_user
    ON hoshin_objectives (user_id, horizon);

CREATE TABLE hoshin_links (
    id              UUID PRIMARY KEY
                        DEFAULT gen_random_uuid(),
    objective_id    UUID NOT NULL
        REFERENCES hoshin_objectives(id)
        ON DELETE CASCADE,
    organisation_id UUID NOT NULL
        REFERENCES organisations(id)
        ON DELETE CASCADE,
    strength        TEXT NOT NULL DEFAULT 'strong'
                    CHECK (strength IN (
                        'strong', 'medium', 'weak'
                    )),
    UNIQUE (objective_id, organisation_id)
);

CREATE INDEX idx_hoshin_links_obj
    ON hoshin_links (objective_id);
CREATE INDEX idx_hoshin_links_org
    ON hoshin_links (organisation_id);
