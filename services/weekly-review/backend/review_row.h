#pragma once
/**
 * @file review_row.h
 * @brief Free function to hydrate a weekly_review
 *        JSON object from a DB row.
 *        Included by review_read.cpp and
 *        review_write.cpp only.
 */

#include "review_types.h"
#include <drogon/orm/Row.h>

namespace services::weekly_review
{

/**
 * @brief Convert a DB row to a WeeklyReview JSON.
 * @param r  ORM row from weekly_reviews table.
 * @returns  JSON object with camelCase keys.
 */
inline json reviewRowToJson(
    const drogon::orm::Row& r)
{
    json out;
    out["id"] =
        r["id"].as<std::string>();
    out["userId"] =
        r["user_id"].as<std::string>();
    out["weekStart"] =
        r["week_start"].as<std::string>();
    out["wins"] =
        r["wins"].as<std::string>();
    out["challenges"] =
        r["challenges"].as<std::string>();
    out["nextGoals"] =
        r["next_goals"].as<std::string>();
    out["morale"] =
        r["morale"].as<int>();
    out["createdAt"] =
        r["created_at"].as<std::string>();
    return out;
}

} // namespace services::weekly_review
