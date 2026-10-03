/**
 * @file HoshinObjWriteController.cpp
 * @brief POST/DELETE /api/hoshin/objectives
 */

#include "HoshinController.h"
#include "drogon-host/backend/utils/JsonResponse.h"
#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

using json = nlohmann::json;
using Cb = std::function<void(
    const drogon::HttpResponsePtr&)>;

namespace controllers
{

void HoshinController::createObjective(
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
    svc_.createObjective(
        userId, body,
        [cb](const json& d) {
            cb(::utils::jsonCreated(d));
        },
        [cb](drogon::HttpStatusCode c,
             const std::string& m) {
            spdlog::warn("createObjective err: {}", m);
            cb(::utils::jsonError(c, m));
        });
}

void HoshinController::deleteObjective(
    const drogon::HttpRequestPtr& req,
    Cb&& cb, std::string id)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    svc_.deleteObjective(
        id, userId,
        [cb](const json&) {
            cb(::utils::jsonOk(json::object()));
        },
        [cb](drogon::HttpStatusCode c,
             const std::string& m) {
            spdlog::warn("deleteObjective err: {}", m);
            cb(::utils::jsonError(c, m));
        });
}

} // namespace controllers
