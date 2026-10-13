/**
 * @file pivot_write.cpp
 * @brief PivotService::updatePivot and
 *        PivotService::deletePivot methods.
 */

#include "PivotService.h"
#include "pivot_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::pivot
{

using drogon::orm::Result;

void PivotService::updatePivot(
    const std::string& id,
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
        "UPDATE pivots SET"
        "  original_idea=$3, new_direction=$4,"
        "  trigger_event=$5, rationale=$6,"
        "  plan_impact=$7,"
        "  pivoted_at=COALESCE("
        "    NULLIF($8,'')::date, CURRENT_DATE)"
        " WHERE id=$1::uuid AND user_id=$2::uuid"
        " RETURNING id::text, user_id::text,"
        "  original_idea, new_direction,"
        "  trigger_event, rationale,"
        "  plan_impact, pivoted_at::text,"
        "  created_at::text";
    db()->execSqlAsync(
        sql,
        [ok, err](const Result& res) {
            if (res.empty()) {
                err(drogon::k404NotFound,
                    "pivot not found");
                return;
            }
            ok(pivotRowToJson(res[0]));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("updatePivot: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        id, userId, orig, newDir,
        trig, rat, imp, date);
}

void PivotService::deletePivot(
    const std::string& id,
    const std::string& userId,
    Callback ok,
    ErrCallback err)
{
    const auto sql =
        "DELETE FROM pivots"
        " WHERE id=$1::uuid AND user_id=$2::uuid";
    db()->execSqlAsync(
        sql,
        [ok](const Result&) {
            ok(json::object());
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("deletePivot: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        id, userId);
}

} // namespace services::pivot
