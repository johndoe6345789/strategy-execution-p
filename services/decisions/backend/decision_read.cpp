/**
 * @file decision_read.cpp
 * @brief DecisionService::listDecisions implementation.
 */

#include "DecisionService.h"
#include "decision_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::decisions
{

using drogon::orm::Result;

void DecisionService::listDecisions(
    const std::string& userId,
    const std::string& searchTerm,
    Callback ok,
    ErrCallback err)
{
    std::string term = searchTerm.empty()
        ? "" : "%" + searchTerm + "%";
    const auto sql =
        "SELECT id::text, user_id::text, title,"
        " context, options_considered, decision,"
        " rationale, planner_step_id, outcome,"
        " created_at::text, updated_at::text"
        " FROM decisions"
        " WHERE user_id=$1::uuid"
        " AND ($2='' OR title ILIKE $2"
        "      OR decision ILIKE $2)"
        " ORDER BY created_at DESC";
    db()->execSqlAsync(
        sql,
        [ok](const Result& res) {
            json arr = json::array();
            for (const auto& r : res)
                arr.push_back(decisionRowToJson(r));
            ok(std::move(arr));
        },
        [err](
            const drogon::orm::DrogonDbException& e) {
            spdlog::error("listDecisions: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId, term);
}

} // namespace services::decisions
