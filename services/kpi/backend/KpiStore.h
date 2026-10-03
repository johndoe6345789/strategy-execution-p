#pragma once
/**
 * @file KpiStore.h
 * @brief Async CRUD store for kpi_metrics table.
 */

#include "kpi_types.h"
#include <string>

namespace services::kpi
{

/** @brief Async CRUD store for KPI scorecard metrics. */
class KpiStore
{
  public:
    /**
     * @brief List all KPI metrics for a user.
     * @param userId UUID of the authenticated user.
     * @param ok     Called with JSON array.
     * @param err    Called with status + message.
     */
    void list(
        const std::string& userId,
        Callback ok, ErrCallback err);

    /**
     * @brief Create a new KPI metric.
     * @param userId UUID of the authenticated user.
     * @param data   Request body fields.
     * @param ok     Called with created row JSON.
     * @param err    Called with status + message.
     */
    void create(
        const std::string& userId,
        const json& data,
        Callback ok, ErrCallback err);

    /**
     * @brief Update current value (and recalc trend/status).
     * @param id      UUID of the metric.
     * @param userId  UUID of the authenticated user.
     * @param newVal  New current_val.
     * @param ok      Called with updated row JSON.
     * @param err     Called with status + message.
     */
    void updateValue(
        const std::string& id,
        const std::string& userId,
        double newVal,
        Callback ok, ErrCallback err);

    /**
     * @brief Delete a KPI metric.
     * @param id     UUID of the metric.
     * @param userId UUID of the authenticated user.
     * @param ok     Called with empty JSON object.
     * @param err    Called with status + message.
     */
    void remove(
        const std::string& id,
        const std::string& userId,
        Callback ok, ErrCallback err);

  private:
    static auto db()
        { return drogon::app().getDbClient(); }
};

} // namespace services::kpi
