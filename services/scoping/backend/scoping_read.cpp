/**
 * @file scoping_read.cpp
 * @brief ScopingService::listFeatures implementation.
 */

#include "ScopingService.h"
#include "scoping_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::scoping
{

using drogon::orm::Result;

void ScopingService::listFeatures(
    const std::string& userId,
    Callback ok,
    ErrCallback err)
{
    const auto sql =
        "SELECT id::text, title, description,"
        " impact, confidence, ease, status,"
        " created_at::text, updated_at::text"
        " FROM scoped_features"
        " WHERE user_id=$1::uuid"
        " ORDER BY"
        "  (impact * confidence * ease) DESC";
    db()->execSqlAsync(
        sql,
        [ok](const Result& res) {
            json arr = json::array();
            for (const auto& r : res)
                arr.push_back(
                    scopingRowToJson(r));
            ok(std::move(arr));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("listFeatures: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId);
}

} // namespace services::scoping
