#pragma once
/**
 * @file dec_handler_decls.h
 * @brief Macro expanding to all method declarations
 *        for DecisionController.
 *        Included by DecisionController.h.
 */

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>
#include <string>

/**
 * @brief Declares all handler methods for the
 *        DecisionController class body.
 */
// clang-format off
#define DEC_HANDLER_DECLS \
    /** @brief GET /api/decisions */ \
    void listDecisions( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb); \
    /** @brief POST /api/decisions */ \
    void createDecision( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb); \
    /** @brief PUT /api/decisions/{id} */ \
    void updateDecision( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb, \
        std::string id); \
    /** @brief DELETE /api/decisions/{id} */ \
    void deleteDecision( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb, \
        std::string id);
// clang-format on
