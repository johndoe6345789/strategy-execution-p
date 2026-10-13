/**
 * @file DecisionReadController.cpp
 * @brief GET + POST /api/decisions
 */

#include "DecisionController.h"
#include "drogon-host/backend/utils/JsonResponse.h"

#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

using json = nlohmann::json;
using Cb = std::function<void(
    const drogon::HttpResponsePtr&)>;

namespace controllers
{

void DecisionController::listDecisions(
    const drogon::HttpRequestPtr& req,
    Cb&& cb)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    auto search = req->getParameter("search");
    spdlog::debug(
        "listDecisions userId={}", userId);

    svc_.listDecisions(
        userId, search,
        [cb](const json& data) {
            cb(::utils::jsonOk(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "listDecisions error: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

void DecisionController::createDecision(
    const drogon::HttpRequestPtr& req,
    Cb&& cb)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    auto body = json::parse(
        req->getBody(), nullptr, false);
    if (body.is_discarded()) {
        cb(::utils::jsonError(
            drogon::k400BadRequest,
            "invalid JSON body"));
        return;
    }

    svc_.createDecision(
        userId, body,
        [cb](const json& data) {
            cb(::utils::jsonCreated(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "createDecision error: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

} // namespace controllers
