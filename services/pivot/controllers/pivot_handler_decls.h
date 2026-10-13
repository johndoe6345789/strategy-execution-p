#pragma once
/**
 * @file pivot_handler_decls.h
 * @brief Macro expanding to all method declarations
 *        for PivotController.
 *        Included by PivotController.h.
 */

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <string>

/**
 * @brief Declares all handler methods for the
 *        PivotController class body.
 */
// clang-format off
#define PIVOT_HANDLER_DECLS \
    /** @brief GET /api/pivots */ \
    void listPivots( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb); \
    /** @brief POST /api/pivots */ \
    void createPivot( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb); \
    /** @brief PUT /api/pivots/{id} */ \
    void updatePivot( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb, \
        std::string id); \
    /** @brief DELETE /api/pivots/{id} */ \
    void deletePivot( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb, \
        std::string id);
// clang-format on
