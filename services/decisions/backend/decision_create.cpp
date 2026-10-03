/**
 * @file decision_create.cpp
 * @brief DecisionService::createDecision method.
 */

#include "DecisionService.h"
#include "decision_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::decisions
{

using drogon::orm::Result;

void DecisionService::createDecision(
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
        "INSERT INTO decisions"
        " (user_id, title, context,"
        "  options_considered, decision,"
        "  rationale, planner_step_id, outcome)"
        " VALUES ($1::uuid,$2,$3,$4,$5,$6,$7,$8)"
        " RETURNING id::text, user_id::text,"
        "  title, context, options_considered,"
        "  decision, rationale, planner_step_id,"
        "  outcome, created_at::text,"
        "  updated_at::text";
    db()->execSqlAsync(
        sql,
        [ok, err](const Result& res) {
            if (res.empty()) {
                err(drogon::k500InternalServerError,
                    "insert failed");
                return;
            }
            ok(decisionRowToJson(res[0]));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("createDecision: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId, title, ctx, opts,
        dec, rat, step, out);
}

} // namespace services::decisions
