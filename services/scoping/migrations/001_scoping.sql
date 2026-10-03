-- MVP feature scoping and ICE prioritisation
-- TODO (v2): add startup_id FK once D23 exists
CREATE TABLE scoped_features (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    impact      INT NOT NULL DEFAULT 5
                CHECK (impact BETWEEN 1 AND 10),
    confidence  INT NOT NULL DEFAULT 5
                CHECK (confidence BETWEEN 1 AND 10),
    ease        INT NOT NULL DEFAULT 5
                CHECK (ease BETWEEN 1 AND 10),
    status      TEXT NOT NULL DEFAULT 'considering'
                CHECK (status IN (
                    'in_mvp', 'later', 'cut', 'considering'
                )),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_scoped_features_user
    ON scoped_features(user_id);
