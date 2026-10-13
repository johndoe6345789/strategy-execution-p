/**
 * @file okr_store_kr_update.cpp
 * @brief OkrStore::updateKeyResult — recalculates progress
 *        and status using the source component's formula:
 *        progress = clamp(((val-start)/(target-start))*100,
 *                         0, 100).
 */

#include "OkrStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::okr
{

using drogon::orm::Result;

void OkrStore::updateKeyResult(
    const std::string& krId, const std::string& uid,
    double val, Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "UPDATE okr_key_results k SET"
        " current_value=$2,"
        " progress=GREATEST(0,LEAST(100,"
        "  CASE WHEN k.target_value=k.start_value THEN 0"
        "  ELSE (($2-k.start_value)*100.0)"
        "       /(k.target_value-k.start_value) END)),"
        " status=CASE"
        "  WHEN (($2-k.start_value)*100.0)"
        "   /NULLIF(k.target_value-k.start_value,0)>=100"
        "   THEN 'achieved'"
        "  WHEN (($2-k.start_value)*100.0)"
        "   /NULLIF(k.target_value-k.start_value,0)>=70"
        "   THEN 'on-track'"
        "  WHEN (($2-k.start_value)*100.0)"
        "   /NULLIF(k.target_value-k.start_value,0)>=40"
        "   THEN 'at-risk' ELSE 'behind' END,"
        " last_updated=NOW()"
        " FROM okr_objectives o"
        " WHERE k.id=$1::uuid AND k.objective_id=o.id"
        "  AND o.user_id=$3::uuid"
        " RETURNING k.id::text,k.current_value,"
        "           k.progress,k.status",
        [ok](const Result& res) {
            if (res.empty()) { ok(json::object()); return; }
            const auto& r = res[0];
            ok({{"id",r["id"].as<std::string>()},
                {"current_value",
                 r["current_value"].as<double>()},
                {"progress",r["progress"].as<double>()},
                {"status",r["status"].as<std::string>()}});
        },
        [err](const drogon::orm::DrogonDbException& e) {
            spdlog::error("okr update kr: {}", e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        krId, val, uid);
}

} // namespace services::okr
