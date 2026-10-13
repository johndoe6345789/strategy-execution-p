#pragma once
/**
 * @file dec_routes.h
 * @brief ADD_METHOD_TO registrations for
 *        DecisionController.
 *        Included inside METHOD_LIST_BEGIN/END.
 */

// clang-format off
#define DEC_ROUTES(C) \
    ADD_METHOD_TO(C::listDecisions, \
        "/api/decisions", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::createDecision, \
        "/api/decisions", \
        drogon::Post, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::updateDecision, \
        "/api/decisions/{id}", \
        drogon::Put, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::deleteDecision, \
        "/api/decisions/{id}", \
        drogon::Delete, "filters::JwtAuthFilter");
// clang-format on
