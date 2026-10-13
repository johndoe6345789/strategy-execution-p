#pragma once
/**
 * @file bowling_routes.h
 * @brief ADD_METHOD_TO registrations for
 *        BowlingController.
 *        Included inside METHOD_LIST_BEGIN/END.
 */

// clang-format off
#define BOWLING_ROUTES(C) \
    ADD_METHOD_TO(C::listObjectives, \
        "/api/hoshin/bowling", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::createObjective, \
        "/api/hoshin/bowling", \
        drogon::Post, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::deleteObjective, \
        "/api/hoshin/bowling/{id}", \
        drogon::Delete, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::upsertMonth, \
        "/api/hoshin/bowling/{objId}/months", \
        drogon::Put, "filters::JwtAuthFilter");
// clang-format on
