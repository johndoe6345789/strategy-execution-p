/**
 * @file scoping_mutate.cpp
 * @brief ScopingService update + delete.
 */

#include "ScopingService.h"
#include "scoping_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::scoping
{

using drogon::orm::Result;

void ScopingService::updateFeature(
    const std::string& id,
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
        "UPDATE scoped_features SET"
        "  title=$3, description=$4,"
        "  impact=$5, confidence=$6,"
        "  ease=$7, status=$8,"
        "  updated_at=NOW()"
        " WHERE id=$1::uuid AND user_id=$2::uuid"
        " RETURNING id::text,title,description,"
        "  impact,confidence,ease,status,"
        "  created_at::text,updated_at::text";
    db()->execSqlAsync(
        sql,
        [ok, err](const Result& res) {
            if (res.empty()) {
                err(drogon::k404NotFound,
                    "feature not found");
                return;
            }
            ok(scopingRowToJson(res[0]));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("updateFeature: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        id, userId, title, desc,
        impact, conf, ease, status);
}

void ScopingService::deleteFeature(
    const std::string& id,
    const std::string& userId,
    Callback ok,
    ErrCallback err)
{
    const auto sql =
        "DELETE FROM scoped_features"
        " WHERE id=$1::uuid AND user_id=$2::uuid";
    db()->execSqlAsync(
        sql,
        [ok](const Result&) {
            ok(json::object());
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("deleteFeature: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        id, userId);
}

} // namespace services::scoping
