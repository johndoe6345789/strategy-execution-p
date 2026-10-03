-- Migration: weekly-review domain
CREATE TABLE weekly_reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL
                REFERENCES users(id) ON DELETE CASCADE,
    week_start  DATE NOT NULL,
    wins        TEXT NOT NULL DEFAULT '',
    challenges  TEXT NOT NULL DEFAULT '',
    next_goals  TEXT NOT NULL DEFAULT '',
    morale      INT NOT NULL DEFAULT 3
                CHECK (morale BETWEEN 1 AND 5),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_weekly_review_user_week
    ON weekly_reviews(user_id, week_start);
CREATE INDEX idx_weekly_reviews_user
    ON weekly_reviews(user_id, created_at DESC);
