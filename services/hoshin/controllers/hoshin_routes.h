#pragma once
/**
 * @file hoshin_routes.h
 * @brief ADD_METHOD_TO registrations for
 *        HoshinController.
 *        Included inside METHOD_LIST_BEGIN/END.
 */

// clang-format off
#define HOSHIN_ROUTES(C) \
    ADD_METHOD_TO(C::listObjectives, \
        "/api/hoshin/objectives", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::createObjective, \
        "/api/hoshin/objectives", \
        drogon::Post, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::deleteObjective, \
        "/api/hoshin/objectives/{id}", \
        drogon::Delete, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::listLinks, \
        "/api/hoshin/links", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::createLink, \
        "/api/hoshin/links", \
        drogon::Post, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::deleteLink, \
        "/api/hoshin/links/{id}", \
        drogon::Delete, "filters::JwtAuthFilter");
// clang-format on
