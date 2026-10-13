#pragma once
/**
 * @file decision_row.h
 * @brief Internal helper: hydrate decision JSON
 *        from a database row.
 *        Included by decision_read.cpp and
 *        decision_write.cpp only.
 */

#include "decision_types.h"
#include <drogon/orm/Row.h>

namespace services::decisions
{

/**
 * @brief Hydrate a decision JSON object from a DB row.
 * @param r  Database row from the decisions table.
 * @return   JSON object with all decision fields.
 */
inline json decisionRowToJson(
    const drogon::orm::Row& r)
{
    json out;
    out["id"] = r["id"].as<std::string>();
    out["user_id"] =
        r["user_id"].as<std::string>();
    out["title"] = r["title"].as<std::string>();
    out["context"] =
        r["context"].as<std::string>();
    out["options_considered"] =
        r["options_considered"].as<std::string>();
    out["decision"] =
        r["decision"].as<std::string>();
    out["rationale"] =
        r["rationale"].as<std::string>();
    out["planner_step_id"] =
        r["planner_step_id"].as<std::string>();
    out["outcome"] =
        r["outcome"].as<std::string>();
    out["created_at"] =
        r["created_at"].as<std::string>();
    out["updated_at"] =
        r["updated_at"].as<std::string>();
    return out;
}

} // namespace services::decisions
