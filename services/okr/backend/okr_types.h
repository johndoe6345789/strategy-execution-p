#pragma once
/**
 * @file okr_types.h
 * @brief Shared type aliases for the okr domain.
 */

#include <drogon/drogon.h>
#include <nlohmann/json.hpp>
#include <functional>
#include <string>

namespace services::okr
{

using json = nlohmann::json;
using Callback =
    std::function<void(json)>;
using ErrCallback =
    std::function<void(
        drogon::HttpStatusCode,
        std::string)>;

} // namespace services::okr
