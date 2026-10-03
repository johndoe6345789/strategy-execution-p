/**
 * @file DecisionMutController.cpp
 * @brief PUT /{id} + DELETE /{id}
 *        for /api/decisions
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

void DecisionController::updateDecision(
    const drogon::HttpRequestPtr& req,
    Cb&& cb,
    std::string id)
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

    svc_.updateDecision(
        id, userId, body,
        [cb](const json& data) {
            cb(::utils::jsonOk(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "updateDecision error: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

void DecisionController::deleteDecision(
    const drogon::HttpRequestPtr& req,
    Cb&& cb,
    std::string id)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    spdlog::debug("deleteDecision id={}", id);

    svc_.deleteDecision(
        id, userId,
        [cb](const json&) {
            cb(::utils::jsonOk(json::object()));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "deleteDecision error: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

} // namespace controllers
