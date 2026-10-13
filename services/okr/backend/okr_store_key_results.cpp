/**
 * @file okr_store_key_results.cpp
 * @brief OkrStore::addKeyResult and deleteKeyResult.
 */

#include "OkrStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::okr
{

using drogon::orm::Result;

static auto dbErr(ErrCallback err) {
    return [err](const drogon::orm::DrogonDbException& e) {
        spdlog::error("okr kr: {}", e.base().what());
        err(drogon::k500InternalServerError, e.base().what());
    };
}

void OkrStore::addKeyResult(
    const std::string& objId, const std::string& uid,
    const json& d, Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "INSERT INTO okr_key_results"
        "(objective_id,description,start_value,"
        " current_value,target_value,unit)"
        " SELECT $1::uuid,$3,$4,$4,$5,$6"
        " FROM okr_objectives"
        " WHERE id=$1::uuid AND user_id=$2::uuid"
        " RETURNING id::text,description,start_value,"
        " current_value,target_value,unit,progress,status",
        [ok](const Result& res) {
            if (res.empty()) { ok(json::object()); return; }
            const auto& r = res[0];
            ok({{"id",r["id"].as<std::string>()},
                {"description",
                 r["description"].as<std::string>()},
                {"start_value",r["start_value"].as<double>()},
                {"current_value",
                 r["current_value"].as<double>()},
                {"target_value",r["target_value"].as<double>()},
                {"unit",r["unit"].as<std::string>()},
                {"progress",r["progress"].as<double>()},
                {"status",r["status"].as<std::string>()}});
        },
        dbErr(err), objId, uid,
        d.value("description",""),
        d.value("start_value",0.0),
        d.value("target_value",0.0),
        d.value("unit",""));
}

void OkrStore::deleteKeyResult(
    const std::string& krId, const std::string& uid,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "DELETE FROM okr_key_results k"
        " USING okr_objectives o"
        " WHERE k.id=$1::uuid AND k.objective_id=o.id"
        "  AND o.user_id=$2::uuid",
        [ok](const Result&) { ok(json::object()); },
        dbErr(err), krId, uid);
}

} // namespace services::okr
