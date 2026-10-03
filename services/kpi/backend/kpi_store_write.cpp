/**
 * @file kpi_store_write.cpp
 * @brief KpiStore::updateValue and remove implementations.
 */

#include "KpiStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::kpi
{

using drogon::orm::Result;

static auto dbErr(ErrCallback err)
{
    return [err](const drogon::orm::DrogonDbException& e) {
        spdlog::error("kpi write: {}", e.base().what());
        err(drogon::k500InternalServerError, e.base().what());
    };
}

void KpiStore::updateValue(
    const std::string& id,
    const std::string& uid,
    double v,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "UPDATE kpi_metrics SET current_val=$3,"
        " trend=CASE WHEN $3>current_val THEN 'up'"
        "            WHEN $3<current_val THEN 'down'"
        "            ELSE 'flat' END,"
        " status=CASE"
        "   WHEN ($3/NULLIF(target_val,0))*100>=90"
        "   THEN 'on-track'"
        "   WHEN ($3/NULLIF(target_val,0))*100>=70"
        "   THEN 'at-risk' ELSE 'off-track' END,"
        " last_updated=NOW(), updated_at=NOW()"
        " WHERE id=$1::uuid AND user_id=$2::uuid"
        " RETURNING id::text,current_val,trend,status,"
        "           last_updated::text",
        [ok](const Result& res) {
            if (res.empty()) { ok(json::object()); return; }
            const auto& r = res[0];
            ok({{"id",r["id"].as<std::string>()},
                {"current_val",r["current_val"].as<double>()},
                {"trend",r["trend"].as<std::string>()},
                {"status",r["status"].as<std::string>()}});
        },
        dbErr(err), id, uid, v);
}

void KpiStore::remove(
    const std::string& id,
    const std::string& uid,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "DELETE FROM kpi_metrics"
        " WHERE id=$1::uuid AND user_id=$2::uuid",
        [ok](const Result&) { ok(json::object()); },
        dbErr(err), id, uid);
}

} // namespace services::kpi
