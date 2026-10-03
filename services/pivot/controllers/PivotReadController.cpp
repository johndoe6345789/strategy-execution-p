/**
 * @file PivotReadController.cpp
 * @brief GET + POST /api/pivots
 */

#include "PivotController.h"
#include "drogon-host/backend/utils/JsonResponse.h"

#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

using json = nlohmann::json;
using Cb = std::function<void(
    const drogon::HttpResponsePtr&)>;

namespace controllers
{

void PivotController::listPivots(
    const drogon::HttpRequestPtr& req,
    Cb&& cb)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    spdlog::debug(
        "listPivots userId={}", userId);

    svc_.listPivots(
        userId,
        [cb](const json& data) {
            cb(::utils::jsonOk(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "listPivots error: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

void PivotController::createPivot(
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

    svc_.createPivot(
        userId, body,
        [cb](const json& data) {
            cb(::utils::jsonCreated(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "createPivot error: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

} // namespace controllers
