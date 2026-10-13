/**
 * @file pivot_read.cpp
 * @brief PivotService::listPivots implementation.
 */

#include "PivotService.h"
#include "pivot_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::pivot
{

using drogon::orm::Result;

void PivotService::listPivots(
    const std::string& userId,
    Callback ok,
    ErrCallback err)
{
    const auto sql =
        "SELECT id::text, user_id::text,"
        " original_idea, new_direction,"
        " trigger_event, rationale,"
        " plan_impact, pivoted_at::text,"
        " created_at::text"
        " FROM pivots"
        " WHERE user_id=$1::uuid"
        " ORDER BY pivoted_at DESC";
    db()->execSqlAsync(
        sql,
        [ok](const Result& res) {
            json arr = json::array();
            for (const auto& r : res)
                arr.push_back(pivotRowToJson(r));
            ok(std::move(arr));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("listPivots: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId);
}

} // namespace services::pivot
