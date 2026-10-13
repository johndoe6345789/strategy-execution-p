/**
 * @file okr_store_list.cpp
 * @brief OkrStore::listObjectives — objectives with
 *        nested key results via JSON aggregation.
 */

#include "OkrStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::okr
{

using drogon::orm::Result;

void OkrStore::listObjectives(
    const std::string& uid,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "SELECT o.id::text, o.title, o.description,"
        " o.owner, o.category, o.timeframe, o.quarter,"
        " o.year::int, o.status,"
        " o.created_at::text, o.updated_at::text,"
        " COALESCE(json_agg(json_build_object("
        "  'id',k.id::text,'description',k.description,"
        "  'start_value',k.start_value,"
        "  'current_value',k.current_value,"
        "  'target_value',k.target_value,"
        "  'unit',k.unit,'progress',k.progress,"
        "  'status',k.status,"
        "  'last_updated',k.last_updated::text)"
        "  ORDER BY k.created_at)"
        "  FILTER (WHERE k.id IS NOT NULL),'[]')"
        " AS key_results"
        " FROM okr_objectives o"
        " LEFT JOIN okr_key_results k"
        "  ON k.objective_id=o.id"
        " WHERE o.user_id=$1::uuid"
        " GROUP BY o.id ORDER BY o.created_at DESC",
        [ok](const Result& res) {
            json arr = json::array();
            for (const auto& r : res) {
                arr.push_back({
                    {"id",r["id"].as<std::string>()},
                    {"title",r["title"].as<std::string>()},
                    {"description",
                     r["description"].as<std::string>()},
                    {"owner",r["owner"].as<std::string>()},
                    {"category",
                     r["category"].as<std::string>()},
                    {"timeframe",
                     r["timeframe"].as<std::string>()},
                    {"quarter", r["quarter"].isNull()
                        ? json(nullptr)
                        : json(r["quarter"].as<std::string>())},
                    {"year", r["year"].as<int>()},
                    {"status",r["status"].as<std::string>()},
                    {"key_results", json::parse(
                        r["key_results"].as<std::string>())},
                });
            }
            ok(std::move(arr));
        },
        [err](const drogon::orm::DrogonDbException& e) {
            spdlog::error("okr list: {}", e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        uid);
}

} // namespace services::okr
