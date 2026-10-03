#pragma once
/**
 * @file scoping_handler_decls.h
 * @brief Macro expanding to all method declarations
 *        for ScopingController.
 *        Included by ScopingController.h.
 */

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <string>

/**
 * @brief Declares all handler methods for the
 *        ScopingController class body.
 */
// clang-format off
#define SCOPING_HANDLER_DECLS \
    /** @brief GET /api/scoping/features */ \
    void listFeatures( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb); \
    /** @brief POST /api/scoping/features */ \
    void createFeature( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb); \
    /** @brief PUT /api/scoping/features/{id} */ \
    void updateFeature( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb, \
        std::string id); \
    /** @brief DELETE /api/scoping/features/{id} */ \
    void deleteFeature( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb, \
        std::string id);
// clang-format on
