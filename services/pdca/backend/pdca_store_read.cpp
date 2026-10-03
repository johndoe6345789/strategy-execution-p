/**
 * @file pdca_store_read.cpp
 * @brief PdcaStore::list implementation.
 */

#include "PdcaStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::pdca
{

using drogon::orm::Result;

static json rowToJson(const drogon::orm::Row& r)
{
    return {
        {"id",           r["id"].as<std::string>()},
        {"title",        r["title"].as<std::string>()},
        {"description",  r["description"].as<std::string>()},
        {"category",     r["category"].as<std::string>()},
        {"current_phase",r["current_phase"].as<std::string>()},
        {"status",       r["status"].as<std::string>()},
        {"owner",        r["owner"].as<std::string>()},
        {"start_date",   r["start_date"].as<std::string>()},
        {"plan_phase",
            json::parse(r["plan_phase"].as<std::string>())},
        {"do_phase",
            json::parse(r["do_phase"].as<std::string>())},
        {"check_phase",
            json::parse(r["check_phase"].as<std::string>())},
        {"act_phase",
            json::parse(r["act_phase"].as<std::string>())},
        {"created_at",   r["created_at"].as<std::string>()},
    };
}

void PdcaStore::list(
    const std::string& userId,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "SELECT id::text, title, description, category,"
        " current_phase, status, owner,"
        " start_date::text,"
        " plan_phase::text, do_phase::text,"
        " check_phase::text, act_phase::text,"
        " created_at::text"
        " FROM pdca_cycles WHERE user_id=$1::uuid"
        " ORDER BY created_at DESC",
        [ok](const Result& res) {
            json arr = json::array();
            for (const auto& r : res)
                arr.push_back(rowToJson(r));
            ok(std::move(arr));
        },
        [err](const drogon::orm::DrogonDbException& e) {
            spdlog::error("pdca list: {}", e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId);
}

} // namespace services::pdca
