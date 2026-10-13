#pragma once
/**
 * @file scoping_routes.h
 * @brief ADD_METHOD_TO registrations for
 *        ScopingController.
 *        Included inside METHOD_LIST_BEGIN/END.
 */

// clang-format off
#define SCOPING_ROUTES(C) \
    ADD_METHOD_TO(C::listFeatures, \
        "/api/scoping/features", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::createFeature, \
        "/api/scoping/features", \
        drogon::Post, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::updateFeature, \
        "/api/scoping/features/{id}", \
        drogon::Put, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::deleteFeature, \
        "/api/scoping/features/{id}", \
        drogon::Delete, "filters::JwtAuthFilter");
// clang-format on
