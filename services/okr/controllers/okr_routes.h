#pragma once
/**
 * @file okr_routes.h
 * @brief Route table for the OKR controller.
 */

#define OKR_ROUTES(C) \
    ADD_METHOD_TO(C::listObjectives, \
        "/api/okr/objectives", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::createObjective, \
        "/api/okr/objectives", \
        drogon::Post, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::deleteObjective, \
        "/api/okr/objectives/{id}", \
        drogon::Delete, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::addKeyResult, \
        "/api/okr/objectives/{objectiveId}/kr", \
        drogon::Post, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::updateKeyResult, \
        "/api/okr/kr/{krId}", \
        drogon::Patch, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::deleteKeyResult, \
        "/api/okr/kr/{krId}", \
        drogon::Delete, "filters::JwtAuthFilter");
