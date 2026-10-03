/**
 * @file decision_write.cpp
 * @brief DecisionService update + delete methods.
 */

#include "DecisionService.h"
#include "decision_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::decisions
{

using drogon::orm::Result;

void DecisionService::updateDecision(
    const std::string& id,
    const std::string& userId,
    const json& data,
    Callback ok,
    ErrCallback err)
{
    auto title = data.value("title",
                            std::string{});
    auto ctx   = data.value("context",
                            std::string{});
    auto opts  = data.value("options_considered",
                            std::string{});
    auto dec   = data.value("decision",
                            std::string{});
    auto rat   = data.value("rationale",
                            std::string{});
    auto step  = data.value("planner_step_id",
                            std::string{});
    auto out   = data.value("outcome",
                            std::string{});
    const auto sql =
        "UPDATE decisions SET"
        "  title=$3, context=$4,"
        "  options_considered=$5, decision=$6,"
        "  rationale=$7, planner_step_id=$8,"
        "  outcome=$9, updated_at=NOW()"
        " WHERE id=$1::uuid AND user_id=$2::uuid"
        " RETURNING id::text, user_id::text,"
        "  title, context, options_considered,"
        "  decision, rationale, planner_step_id,"
        "  outcome, created_at::text,"
        "  updated_at::text";
    db()->execSqlAsync(
        sql,
        [ok, err](const Result& res) {
            if (res.empty()) {
                err(drogon::k404NotFound,
                    "decision not found");
                return;
            }
            ok(decisionRowToJson(res[0]));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("updateDecision: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        id, userId, title, ctx, opts,
        dec, rat, step, out);
}

void DecisionService::deleteDecision(
    const std::string& id,
    const std::string& userId,
    Callback ok,
    ErrCallback err)
{
    const auto sql =
        "DELETE FROM decisions"
        " WHERE id=$1::uuid AND user_id=$2::uuid";
    db()->execSqlAsync(
        sql,
        [ok](const Result&) {
            ok(json::object());
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("deleteDecision: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        id, userId);
}

} // namespace services::decisions
