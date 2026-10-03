/**
 * @file PdcaReadController.cpp
 * @brief GET handler for the PDCA domain.
 */

#include "PdcaController.h"
#include "drogon-host/backend/utils/JsonResponse.h"

using Cb = std::function<void(
    const drogon::HttpResponsePtr&)>;

namespace controllers
{

void PdcaController::list(
    const drogon::HttpRequestPtr& req, Cb&& cb)
{
    auto uid = req->attributes()
        ->get<std::string>("user_id");
    svc_.list(uid,
        [cb](const auto& d) { cb(::utils::jsonOk(d)); },
        [cb](auto c, const auto& m) {
            cb(::utils::jsonError(c, m)); });
}

} // namespace controllers
