/**
 * @file review_read.cpp
 * @brief ReviewService::listReviews and
 *        ReviewService::getThisWeek implementations.
 */

#include "ReviewService.h"
#include "review_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::weekly_review
{

using drogon::orm::Result;

void ReviewService::listReviews(
    const std::string& userId,
    Callback ok,
    ErrCallback err)
{
    const auto sql =
        "SELECT id::text, user_id::text,"
        " week_start::text, wins, challenges,"
        " next_goals, morale, created_at::text"
        " FROM weekly_reviews"
        " WHERE user_id=$1::uuid"
        " ORDER BY week_start DESC LIMIT 12";
    db()->execSqlAsync(
        sql,
        [ok](const Result& res) {
            json arr = json::array();
            for (const auto& row : res) {
                arr.push_back(
                    reviewRowToJson(row));
            }
            ok(std::move(arr));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("listReviews: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId);
}

void ReviewService::getThisWeek(
    const std::string& userId,
    Callback ok,
    ErrCallback err)
{
    const auto sql =
        "SELECT id::text, user_id::text,"
        " week_start::text, wins, challenges,"
        " next_goals, morale, created_at::text"
        " FROM weekly_reviews"
        " WHERE user_id=$1::uuid"
        "  AND week_start ="
        "    date_trunc('week', NOW())::date";
    db()->execSqlAsync(
        sql,
        [ok](const Result& res) {
            if (res.empty()) {
                ok(nullptr);
                return;
            }
            ok(reviewRowToJson(res[0]));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("getThisWeek: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId);
}

} // namespace services::weekly_review
