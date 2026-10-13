#pragma once
/**
 * @file hoshin_row.h
 * @brief Row serialisers for hoshin_objectives and
 *        hoshin_links database rows.
 */

#include "hoshin_types.h"
#include <drogon/orm/Row.h>

namespace services::hoshin
{

/** @brief Serialise a hoshin_objectives row. */
inline json objRowToJson(
    const drogon::orm::Row& r)
{
    return {
        {"id",
            r["id"].as<std::string>()},
        {"user_id",
            r["user_id"].as<std::string>()},
        {"title",
            r["title"].as<std::string>()},
        {"description",
            r["description"].as<std::string>()},
        {"horizon",
            r["horizon"].as<std::string>()},
        {"target_date",
            r["target_date"].isNull()
                ? json(nullptr)
                : json(r["target_date"]
                       .as<std::string>())},
        {"sort_order",
            r["sort_order"].as<int>()},
        {"created_at",
            r["created_at"].as<std::string>()},
        {"updated_at",
            r["updated_at"].as<std::string>()},
    };
}

/** @brief Serialise a hoshin_links row. */
inline json linkRowToJson(
    const drogon::orm::Row& r)
{
    return {
        {"id",
            r["id"].as<std::string>()},
        {"objective_id",
            r["objective_id"].as<std::string>()},
        {"organisation_id",
            r["organisation_id"].as<std::string>()},
        {"strength",
            r["strength"].as<std::string>()},
    };
}

} // namespace services::hoshin
