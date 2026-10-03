/**
 * @file OkrObjController.cpp
 * @brief Objective mutation handlers (create, delete).
 */

#include "OkrController.h"
#include "drogon-host/backend/utils/JsonResponse.h"
#include <nlohmann/json.hpp>

using Cb = std::function<void(
    const drogon::HttpResponsePtr&)>;
using json = nlohmann::json;

namespace controllers
{

static std::string uid(
    const drogon::HttpRequestPtr& r)
{
    return r->attributes()
        ->get<std::string>("user_id");
}

void OkrController::createObjective(
    const drogon::HttpRequestPtr& req, Cb&& cb)
{
    auto body = json::parse(
        req->getBody(), nullptr, false);
    if (body.is_discarded()) {
        cb(::utils::jsonError(
            drogon::k400BadRequest, "Invalid JSON"));
        return;
    }
    svc_.createObjective(uid(req), body,
        [cb](const auto& d) { cb(::utils::jsonOk(d)); },
        [cb](auto c, const auto& m) {
            cb(::utils::jsonError(c, m)); });
}

void OkrController::deleteObjective(
    const drogon::HttpRequestPtr& req, Cb&& cb,
    std::string id)
{
    svc_.deleteObjective(id, uid(req),
        [cb](const auto& d) { cb(::utils::jsonOk(d)); },
        [cb](auto c, const auto& m) {
            cb(::utils::jsonError(c, m)); });
}

} // namespace controllers
