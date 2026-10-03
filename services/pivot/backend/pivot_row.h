#pragma once
/**
 * @file pivot_row.h
 * @brief Internal helper: hydrate pivot JSON
 *        from a database row.
 *        Included by pivot_read.cpp and
 *        pivot_write.cpp only.
 */

#include "pivot_types.h"
#include <drogon/orm/Row.h>

namespace services::pivot
{

/**
 * @brief Hydrate a pivot JSON object from a DB row.
 * @param r  Database row from the pivots table.
 * @return   JSON object with all pivot fields.
 */
inline json pivotRowToJson(
    const drogon::orm::Row& r)
{
    json out;
    out["id"] = r["id"].as<std::string>();
    out["user_id"] =
        r["user_id"].as<std::string>();
    out["original_idea"] =
        r["original_idea"].as<std::string>();
    out["new_direction"] =
        r["new_direction"].as<std::string>();
    out["trigger_event"] =
        r["trigger_event"].as<std::string>();
    out["rationale"] =
        r["rationale"].as<std::string>();
    out["plan_impact"] =
        r["plan_impact"].as<std::string>();
    out["pivoted_at"] =
        r["pivoted_at"].as<std::string>();
    out["created_at"] =
        r["created_at"].as<std::string>();
    return out;
}

} // namespace services::pivot
