/**
 * @file KpiWriteController.cpp
 * @brief POST/PATCH/DELETE handlers for KPI scorecard.
 */

#include "KpiController.h"
#include "drogon-host/backend/utils/JsonResponse.h"
#include <nlohmann/json.hpp>

using Cb = std::function<void(
    const drogon::HttpResponsePtr&)>;
using json = nlohmann::json;

namespace controllers
{

void KpiController::create(
    const drogon::HttpRequestPtr& req, Cb&& cb)
{
    auto uid = req->attributes()
        ->get<std::string>("user_id");
    auto body = json::parse(
        req->getBody(), nullptr, false);
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

void KpiController::updateValue(
    const drogon::HttpRequestPtr& req, Cb&& cb,
    std::string id)
{
    auto uid = req->attributes()
        ->get<std::string>("user_id");
    auto body = json::parse(
        req->getBody(), nullptr, false);
    if (body.is_discarded() ||
        !body.contains("value")) {
        cb(::utils::jsonError(
            drogon::k400BadRequest, "value required"));
        return;
    }
    svc_.updateValue(id, uid,
        body["value"].get<double>(),
        [cb](const auto& d) { cb(::utils::jsonOk(d)); },
        [cb](auto c, const auto& m) {
            cb(::utils::jsonError(c, m)); });
}

void KpiController::remove(
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
