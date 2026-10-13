/**
 * @file review_write.cpp
 * @brief ReviewService::submitReview implementation.
 *        Idempotent upsert per (user_id, week_start).
 */

#include "ReviewService.h"
#include "review_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::weekly_review
{

using drogon::orm::Result;

void ReviewService::submitReview(
    const std::string& userId,
    const json& body,
    Callback ok,
    ErrCallback err)
{
    auto wins = body.value(
        "wins", std::string{});
    auto challenges = body.value(
        "challenges", std::string{});
    auto goals = body.value(
        "next_goals", std::string{});
    auto morale = body.value("morale", 3);

    const auto sql =
        "INSERT INTO weekly_reviews"
        " (user_id, week_start,"
        "  wins, challenges,"
        "  next_goals, morale)"
        " VALUES ($1::uuid,"
        "  date_trunc('week',NOW())::date,"
        "  $2, $3, $4, $5)"
        " ON CONFLICT (user_id, week_start)"
        " DO UPDATE SET"
        "  wins=EXCLUDED.wins,"
        "  challenges=EXCLUDED.challenges,"
        "  next_goals=EXCLUDED.next_goals,"
        "  morale=EXCLUDED.morale"
        " RETURNING id::text, user_id::text,"
        "  week_start::text, wins, challenges,"
        "  next_goals, morale, created_at::text";
    db()->execSqlAsync(
        sql,
        [ok, err](const Result& res) {
            if (res.empty()) {
                err(drogon::k500InternalServerError,
                    "upsert failed");
                return;
            }
            ok(reviewRowToJson(res[0]));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("submitReview: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId, wins, challenges, goals, morale);
}

} // namespace services::weekly_review
