/**
 * @file pdca_store_write.cpp
 * @brief PdcaStore::create and remove implementations.
 */

#include "PdcaStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::pdca
{

using drogon::orm::Result;

static auto dbErr(ErrCallback err) {
    return [err](const drogon::orm::DrogonDbException& e) {
        spdlog::error("pdca: {}", e.base().what());
        err(drogon::k500InternalServerError, e.base().what());
    };
}

void PdcaStore::create(
    const std::string& uid, const json& d,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "INSERT INTO pdca_cycles"
        "(user_id,title,description,category,owner,start_date)"
        " VALUES($1::uuid,$2,$3,$4,$5,"
        "  COALESCE($6::date, CURRENT_DATE))"
        " RETURNING id::text,title,current_phase,"
        " status,owner,start_date::text,created_at::text",
        [ok](const Result& res) {
            const auto& r = res[0];
            ok({{"id",r["id"].as<std::string>()},
                {"title",r["title"].as<std::string>()},
                {"current_phase",
                 r["current_phase"].as<std::string>()},
                {"status",r["status"].as<std::string>()},
                {"owner",r["owner"].as<std::string>()}});
        },
        dbErr(err),
        uid, d.value("title",""), d.value("description",""),
        d.value("category","quality"), d.value("owner",""),
        d.value("start_date",""));
}

void PdcaStore::remove(
    const std::string& id, const std::string& uid,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "DELETE FROM pdca_cycles"
        " WHERE id=$1::uuid AND user_id=$2::uuid",
        [ok](const Result&) { ok(json::object()); },
        dbErr(err), id, uid);
}

} // namespace services::pdca
