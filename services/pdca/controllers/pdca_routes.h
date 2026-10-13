#pragma once
/**
 * @file pdca_routes.h
 * @brief Route table for the PDCA controller.
 */

#define PDCA_ROUTES(C) \
    ADD_METHOD_TO(C::list, \
        "/api/pdca", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::create, \
        "/api/pdca", \
        drogon::Post, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::completePhase, \
        "/api/pdca/{id}/phase", \
        drogon::Patch, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::remove, \
        "/api/pdca/{id}", \
        drogon::Delete, "filters::JwtAuthFilter");
