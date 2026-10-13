/**
 * @file HoshinReadController.cpp
 * @brief GET /api/hoshin/objectives and /links
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

void HoshinController::listObjectives(
    const drogon::HttpRequestPtr& req,
    Cb&& cb)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    spdlog::debug(
        "hoshin:listObjectives uid={}", userId);

    svc_.listObjectives(
        userId,
        [cb](const json& data) {
            cb(::utils::jsonOk(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "listObjectives err: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

void HoshinController::listLinks(
    const drogon::HttpRequestPtr& req,
    Cb&& cb)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    spdlog::debug(
        "hoshin:listLinks uid={}", userId);

    svc_.listLinks(
        userId,
        [cb](const json& data) {
            cb(::utils::jsonOk(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "listLinks err: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

} // namespace controllers
