#pragma once
/**
 * @file scoping_row.h
 * @brief Internal helper: hydrate feature JSON.
 *        Included by scoping_read.cpp and
 *        scoping_write.cpp only.
 */

#include "scoping_types.h"
#include <drogon/orm/Row.h>

namespace services::scoping
{

/**
 * @brief Hydrate a scoped_feature JSON from a DB row.
 *        Adds computed ice_score field.
 * @param r  ORM row from scoped_features table.
 * @return   JSON object with all feature fields.
 */
inline json scopingRowToJson(
    const drogon::orm::Row& r)
{
    json out;
    out["id"]    = r["id"].as<std::string>();
    out["title"] = r["title"].as<std::string>();
    out["description"] =
        r["description"].as<std::string>();
    auto impact     = r["impact"].as<int>();
    auto confidence = r["confidence"].as<int>();
    auto ease       = r["ease"].as<int>();
    out["impact"]     = impact;
    out["confidence"] = confidence;
    out["ease"]       = ease;
    out["ice_score"]  = impact * confidence * ease;
    out["status"]  = r["status"].as<std::string>();
    out["created_at"] =
        r["created_at"].as<std::string>();
    out["updated_at"] =
        r["updated_at"].as<std::string>();
    return out;
}

} // namespace services::scoping
