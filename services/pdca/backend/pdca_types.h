#pragma once
/**
 * @file pdca_types.h
 * @brief Shared type aliases for the pdca domain.
 */

#include <drogon/drogon.h>
#include <nlohmann/json.hpp>
#include <functional>
#include <string>

namespace services::pdca
{

using json = nlohmann::json;
using Callback =
    std::function<void(json)>;
using ErrCallback =
    std::function<void(
        drogon::HttpStatusCode,
        std::string)>;

} // namespace services::pdca
