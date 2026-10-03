/**
 * @file ReviewController.cpp
 * @brief Handlers for GET /api/reviews,
 *        GET /api/reviews/this-week, and
 *        POST /api/reviews.
 */

#include "ReviewController.h"
#include "drogon-host/backend/utils/JsonResponse.h"

#include <nlohmann/json.hpp>
#include <spdlog/spdlog.h>

using json = nlohmann::json;
using Cb = std::function<void(
    const drogon::HttpResponsePtr&)>;

namespace controllers
{

void ReviewController::listReviews(
    const drogon::HttpRequestPtr& req,
    Cb&& cb)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    spdlog::debug("listReviews userId={}", userId);
    svc_.listReviews(
        userId,
        [cb](const json& data) {
            cb(::utils::jsonOk(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn("listReviews err: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

void ReviewController::getThisWeek(
    const drogon::HttpRequestPtr& req,
    Cb&& cb)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    spdlog::debug("getThisWeek userId={}", userId);
    svc_.getThisWeek(
        userId,
        [cb](const json& data) {
            cb(::utils::jsonOk(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn("getThisWeek err: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

void ReviewController::submitReview(
    const drogon::HttpRequestPtr& req,
    Cb&& cb)
{
    auto userId = req->attributes()
        ->get<std::string>("user_id");
    spdlog::debug("submitReview userId={}", userId);
    auto bodyStr = req->getBody();
    auto body = json::parse(
        bodyStr, nullptr, false);
    if (body.is_discarded()) {
        cb(::utils::jsonError(
            drogon::k400BadRequest,
            "invalid JSON body"));
        return;
    }
    svc_.submitReview(
        userId, body,
        [cb](const json& data) {
            cb(::utils::jsonOk(data));
        },
        [cb](drogon::HttpStatusCode code,
             const std::string& msg) {
            spdlog::warn(
                "submitReview err: {}", msg);
            cb(::utils::jsonError(code, msg));
        });
}

} // namespace controllers
