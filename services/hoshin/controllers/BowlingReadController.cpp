/**
 * @file BowlingReadController.cpp
 * @brief GET /api/hoshin/bowling
 */

#include "BowlingController.h"
#include "drogon-host/backend/utils/JsonResponse.h"
#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

using json = nlohmann::json;
using Cb = std::function<void(
    const drogon::HttpResponsePtr&)>;

namespace controllers
{

void BowlingController::listObjectives(
    const drogon::HttpRequestPtr& req,
    Cb&& cb)
{
    auto uid = req->attributes()
        ->get<std::string>("user_id");
    auto yearStr = req->getParameter("year");
    int year = yearStr.empty()
        ? 2025 : std::stoi(yearStr);

    spdlog::debug(
        "bowling:listObjectives uid={} year={}",
        uid, year);

    svc_.listObjectives(uid, year,
        [cb](const json& d) {
            cb(::utils::jsonOk(d)); },
        [cb](drogon::HttpStatusCode c,
             const std::string& m) {
            cb(::utils::jsonError(c, m)); });
}

} // namespace controllers
