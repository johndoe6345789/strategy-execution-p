#pragma once
/**
 * @file pivot_routes.h
 * @brief ADD_METHOD_TO registrations for
 *        PivotController.
 *        Included inside METHOD_LIST_BEGIN/END.
 */

// clang-format off
#define PIVOT_ROUTES(C) \
    ADD_METHOD_TO(C::listPivots, \
        "/api/pivots", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::createPivot, \
        "/api/pivots", \
        drogon::Post, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::updatePivot, \
        "/api/pivots/{id}", \
        drogon::Put, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::deletePivot, \
        "/api/pivots/{id}", \
        drogon::Delete, "filters::JwtAuthFilter");
// clang-format on
