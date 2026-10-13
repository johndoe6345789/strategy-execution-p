/**
 * @file OkrWriteController.cpp
 * @brief Key result mutation handlers (add, update, delete).
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

void OkrController::addKeyResult(
    const drogon::HttpRequestPtr& req, Cb&& cb,
    std::string objectiveId)
{
    auto body = json::parse(
        req->getBody(), nullptr, false);
    if (body.is_discarded()) {
        cb(::utils::jsonError(
            drogon::k400BadRequest, "Invalid JSON"));
        return;
    }
    svc_.addKeyResult(objectiveId, uid(req), body,
        [cb](const auto& d) { cb(::utils::jsonOk(d)); },
        [cb](auto c, const auto& m) {
            cb(::utils::jsonError(c, m)); });
}

void OkrController::updateKeyResult(
    const drogon::HttpRequestPtr& req, Cb&& cb,
    std::string krId)
{
    auto body = json::parse(
        req->getBody(), nullptr, false);
    if (body.is_discarded() ||
        !body.contains("current_value")) {
        cb(::utils::jsonError(
            drogon::k400BadRequest,
            "current_value required"));
        return;
    }
    svc_.updateKeyResult(
        krId, uid(req),
        body["current_value"].get<double>(),
        [cb](const auto& d) { cb(::utils::jsonOk(d)); },
        [cb](auto c, const auto& m) {
            cb(::utils::jsonError(c, m)); });
}

void OkrController::deleteKeyResult(
    const drogon::HttpRequestPtr& req, Cb&& cb,
    std::string krId)
{
    svc_.deleteKeyResult(krId, uid(req),
        [cb](const auto& d) { cb(::utils::jsonOk(d)); },
        [cb](auto c, const auto& m) {
            cb(::utils::jsonError(c, m)); });
}

} // namespace controllers
