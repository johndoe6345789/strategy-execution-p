/**
 * @file bowling_list.cpp
 * @brief BowlingStore::listObjectives — returns objectives
 *        with a JSON array of 12 month status cells.
 */

#include "BowlingStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::hoshin
{

using drogon::orm::Result;

void BowlingStore::listObjectives(
    const std::string& uid, int year,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "SELECT o.id::text, o.title, o.sort_order,"
        " COALESCE(json_agg(json_build_object("
        "  'id',m.id::text,"
        "  'month',m.month,"
        "  'year',m.year,"
        "  'status',m.status,"
        "  'actual',m.actual,"
        "  'target',m.target)"
        "  ORDER BY m.month)"
        "  FILTER (WHERE m.id IS NOT NULL),'[]') AS months"
        " FROM bowling_objectives o"
        " LEFT JOIN bowling_months m"
        "  ON m.objective_id=o.id AND m.year=$2"
        " WHERE o.user_id=$1::uuid"
        " GROUP BY o.id ORDER BY o.sort_order, o.created_at",
        [ok](const Result& res) {
            json arr = json::array();
            for (const auto& r : res) {
                arr.push_back({
                    {"id",r["id"].as<std::string>()},
                    {"title",r["title"].as<std::string>()},
                    {"sort_order",
                     r["sort_order"].as<int>()},
                    {"months",json::parse(
                        r["months"].as<std::string>())},
                });
            }
            ok(std::move(arr));
        },
        [err](const drogon::orm::DrogonDbException& e) {
            spdlog::error("bowling list: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        uid, year);
}

} // namespace services::hoshin
