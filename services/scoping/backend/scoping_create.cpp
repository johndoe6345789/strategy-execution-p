/**
 * @file scoping_create.cpp
 * @brief ScopingService::createFeature.
 */

#include "ScopingService.h"
#include "scoping_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::scoping
{

using drogon::orm::Result;

void ScopingService::createFeature(
    const std::string& userId,
    const json& data,
    Callback ok,
    ErrCallback err)
{
    auto title  = data.value("title",
                             std::string{});
    auto desc   = data.value("description",
                             std::string{});
    auto impact = data.value("impact", 5);
    auto conf   = data.value("confidence", 5);
    auto ease   = data.value("ease", 5);
    auto status = data.value("status",
        std::string{"considering"});
    const auto sql =
        "INSERT INTO scoped_features"
        " (user_id,title,description,"
        "  impact,confidence,ease,status)"
        " VALUES ($1::uuid,$2,$3,$4,$5,$6,$7)"
        " RETURNING id::text,title,description,"
        "  impact,confidence,ease,status,"
        "  created_at::text,updated_at::text";
    db()->execSqlAsync(
        sql,
        [ok, err](const Result& res) {
            if (res.empty()) {
                err(drogon::k500InternalServerError,
                    "insert failed");
                return;
            }
            ok(scopingRowToJson(res[0]));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("createFeature: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId, title, desc,
        impact, conf, ease, status);
}

} // namespace services::scoping
