#pragma once
/**
 * @file review_handler_decls.h
 * @brief Macro expanding to all method declarations
 *        for ReviewController.
 *        Included by ReviewController.h.
 */

#include <drogon/HttpRequest.h>
#include <drogon/HttpResponse.h>
#include <functional>

/**
 * @brief Declares all handler methods for the
 *        ReviewController class body.
 */
// clang-format off
#define REVIEW_HANDLER_DECLS \
    /** @brief GET /api/reviews */ \
    void listReviews( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb); \
    /** @brief GET /api/reviews/this-week */ \
    void getThisWeek( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb); \
    /** @brief POST /api/reviews */ \
    void submitReview( \
        const drogon::HttpRequestPtr& req, \
        std::function<void( \
            const drogon::HttpResponsePtr&)>&& cb);
// clang-format on
