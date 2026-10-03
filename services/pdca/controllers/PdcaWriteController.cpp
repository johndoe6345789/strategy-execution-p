/**
 * @file PdcaWriteController.cpp
 * @brief POST/PATCH/DELETE handlers for PDCA domain.
 */

#include "PdcaController.h"
#include "drogon-host/backend/utils/JsonResponse.h"
#include <nlohmann/json.hpp>

using Cb = std::function<void(
    const drogon::HttpResponsePtr&)>;
using json = nlohmann::json;

namespace controllers
{

static json parseBody(
    const drogon::HttpRequestPtr& req)
{
    return json::parse(req->getBody(), nullptr, false);
}

void PdcaController::create(
    const drogon::HttpRequestPtr& req, Cb&& cb)
{
    auto uid = req->attributes()
        ->get<std::string>("user_id");
    auto body = parseBody(req);
    if (body.is_discarded()) {
        cb(::utils::jsonError(
            drogon::k400BadRequest, "Invalid JSON"));
        return;
    }
    svc_.create(uid, body,
        [cb](const auto& d) { cb(::utils::jsonOk(d)); },
        [cb](auto c, const auto& m) {
            cb(::utils::jsonError(c, m)); });
}

void PdcaController::completePhase(
    const drogon::HttpRequestPtr& req, Cb&& cb,
    std::string id)
{
    auto uid = req->attributes()
        ->get<std::string>("user_id");
    auto body = parseBody(req);
    if (body.is_discarded())
        body = json::object();
    svc_.completePhase(id, uid, body,
        [cb](const auto& d) { cb(::utils::jsonOk(d)); },
        [cb](auto c, const auto& m) {
            cb(::utils::jsonError(c, m)); });
}

void PdcaController::remove(
    const drogon::HttpRequestPtr& req, Cb&& cb,
    std::string id)
{
    auto uid = req->attributes()
        ->get<std::string>("user_id");
    svc_.remove(id, uid,
        [cb](const auto& d) { cb(::utils::jsonOk(d)); },
        [cb](auto c, const auto& m) {
            cb(::utils::jsonError(c, m)); });
}

} // namespace controllers
