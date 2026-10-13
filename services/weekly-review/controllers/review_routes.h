#pragma once
/**
 * @file review_routes.h
 * @brief ADD_METHOD_TO registrations for
 *        ReviewController.
 *        Included inside METHOD_LIST_BEGIN/END.
 */

// clang-format off
#define REVIEW_ROUTES(C) \
    ADD_METHOD_TO(C::listReviews, \
        "/api/reviews", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::getThisWeek, \
        "/api/reviews/this-week", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::submitReview, \
        "/api/reviews", \
        drogon::Post, "filters::JwtAuthFilter");
// clang-format on
