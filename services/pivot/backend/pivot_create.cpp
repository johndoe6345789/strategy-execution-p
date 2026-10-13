/**
 * @file pivot_create.cpp
 * @brief PivotService::createPivot implementation.
 */

#include "PivotService.h"
#include "pivot_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::pivot
{

using drogon::orm::Result;

void PivotService::createPivot(
    const std::string& userId,
    const json& data,
    Callback ok,
    ErrCallback err)
{
    auto orig  = data.value("original_idea",
                            std::string{});
    auto newDir = data.value("new_direction",
                             std::string{});
    auto trig  = data.value("trigger_event",
                            std::string{});
    auto rat   = data.value("rationale",
                            std::string{});
    auto imp   = data.value("plan_impact",
                            std::string{});
    auto date  = data.value("pivoted_at",
                            std::string{});
    const auto sql =
        "INSERT INTO pivots"
        " (user_id, original_idea, new_direction,"
        "  trigger_event, rationale,"
        "  plan_impact, pivoted_at)"
        " VALUES ($1::uuid,$2,$3,$4,$5,$6,"
        "  COALESCE(NULLIF($7,'')::date,"
        "           CURRENT_DATE))"
        " RETURNING id::text, user_id::text,"
        "  original_idea, new_direction,"
        "  trigger_event, rationale,"
        "  plan_impact, pivoted_at::text,"
        "  created_at::text";
    db()->execSqlAsync(
        sql,
        [ok, err](const Result& res) {
            if (res.empty()) {
                err(drogon::k500InternalServerError,
                    "insert failed");
                return;
            }
            ok(pivotRowToJson(res[0]));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("createPivot: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId, orig, newDir, trig, rat, imp, date);
}

} // namespace services::pivot
