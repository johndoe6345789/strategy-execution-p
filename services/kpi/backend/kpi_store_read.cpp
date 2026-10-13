/**
 * @file kpi_store_read.cpp
 * @brief KpiStore::list implementation.
 */

#include "KpiStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::kpi
{

using drogon::orm::Result;

static json rowToJson(const drogon::orm::Row& r)
{
    return {
        {"id",          r["id"].as<std::string>()},
        {"name",        r["name"].as<std::string>()},
        {"category",    r["category"].as<std::string>()},
        {"baseline",    r["baseline"].as<double>()},
        {"current_val", r["current_val"].as<double>()},
        {"target_val",  r["target_val"].as<double>()},
        {"unit",        r["unit"].as<std::string>()},
        {"frequency",   r["frequency"].as<std::string>()},
        {"owner",       r["owner"].as<std::string>()},
        {"trend",       r["trend"].as<std::string>()},
        {"status",      r["status"].as<std::string>()},
        {"last_updated",r["last_updated"].as<std::string>()},
        {"created_at",  r["created_at"].as<std::string>()},
    };
}

void KpiStore::list(
    const std::string& userId,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "SELECT id::text, name, category, baseline,"
        " current_val, target_val, unit, frequency,"
        " owner, trend, status,"
        " last_updated::text, created_at::text"
        " FROM kpi_metrics WHERE user_id=$1::uuid"
        " ORDER BY category, name",
        [ok](const Result& res) {
            json arr = json::array();
            for (const auto& r : res)
                arr.push_back(rowToJson(r));
            ok(std::move(arr));
        },
        [err](const drogon::orm::DrogonDbException& e) {
            spdlog::error("kpi list: {}", e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId);
}

} // namespace services::kpi
