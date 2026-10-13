#pragma once
/**
 * @file kpi_routes.h
 * @brief Route table for the KPI controller.
 */

#define KPI_ROUTES(C) \
    ADD_METHOD_TO(C::list, \
        "/api/kpi", \
        drogon::Get, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::create, \
        "/api/kpi", \
        drogon::Post, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::updateValue, \
        "/api/kpi/{id}/value", \
        drogon::Patch, "filters::JwtAuthFilter"); \
    ADD_METHOD_TO(C::remove, \
        "/api/kpi/{id}", \
        drogon::Delete, "filters::JwtAuthFilter");
