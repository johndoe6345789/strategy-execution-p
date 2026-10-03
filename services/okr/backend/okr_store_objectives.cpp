/**
 * @file okr_store_objectives.cpp
 * @brief OkrStore::createObjective and deleteObjective.
 */

#include "OkrStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::okr
{

using drogon::orm::Result;

static auto dbErr(ErrCallback err) {
    return [err](const drogon::orm::DrogonDbException& e) {
        spdlog::error("okr obj: {}", e.base().what());
        err(drogon::k500InternalServerError, e.base().what());
    };
}

void OkrStore::createObjective(
    const std::string& uid, const json& d,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "INSERT INTO okr_objectives"
        "(user_id,title,description,owner,category,"
        " timeframe,quarter,year)"
        " VALUES($1::uuid,$2,$3,$4,$5,$6,"
        "  NULLIF($7,''),$8::smallint)"
        " RETURNING id::text,title,status,created_at::text",
        [ok](const Result& res) {
            const auto& r = res[0];
            ok({{"id",r["id"].as<std::string>()},
                {"title",r["title"].as<std::string>()},
                {"status",r["status"].as<std::string>()},
                {"key_results",json::array()}});
        },
        dbErr(err),
        uid, d.value("title",""), d.value("description",""),
        d.value("owner",""), d.value("category","company"),
        d.value("timeframe","quarterly"),
        d.value("quarter",""),
        d.value("year", 2025));
}

void OkrStore::deleteObjective(
    const std::string& id, const std::string& uid,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "DELETE FROM okr_objectives"
        " WHERE id=$1::uuid AND user_id=$2::uuid",
        [ok](const Result&) { ok(json::object()); },
        dbErr(err), id, uid);
}

} // namespace services::okr
