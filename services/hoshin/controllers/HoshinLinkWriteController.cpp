/**
 * @file HoshinLinkWriteController.cpp
 * @brief POST/DELETE /api/hoshin/links
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

void HoshinController::createLink(
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
    svc_.createLink(
        userId, body,
        [cb](const json& d) {
            cb(::utils::jsonCreated(d));
        },
        [cb](drogon::HttpStatusCode c,
             const std::string& m) {
            spdlog::warn("createLink err: {}", m);
            cb(::utils::jsonError(c, m));
        });
}

void HoshinController::deleteLink(
    const drogon::HttpRequestPtr& req,
    Cb&& cb, std::string id)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    svc_.deleteLink(
        id, userId,
        [cb](const json&) {
            cb(::utils::jsonOk(json::object()));
        },
        [cb](drogon::HttpStatusCode c,
             const std::string& m) {
            spdlog::warn("deleteLink err: {}", m);
            cb(::utils::jsonError(c, m));
        });
}

} // namespace controllers
