/**
 * @file PivotMutController.cpp
 * @brief PUT /{id} + DELETE /{id}
 *        for /api/pivots
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

void PivotController::updatePivot(
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

    svc_.updatePivot(
        id, userId, body,
        [cb](const json& data) {
            cb(::utils::jsonOk(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "updatePivot error: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

void PivotController::deletePivot(
    const drogon::HttpRequestPtr& req,
    Cb&& cb,
    std::string id)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    spdlog::debug("deletePivot id={}", id);

    svc_.deletePivot(
        id, userId,
        [cb](const json&) {
            cb(::utils::jsonOk(json::object()));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "deletePivot error: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

} // namespace controllers
