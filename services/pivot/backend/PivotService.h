#pragma once
/**
 * @file PivotService.h
 * @brief Service for the pivots table.
 */

#include "pivot_types.h"
#include <string>

namespace services::pivot
{

/**
 * @brief CRUD service for pivot tracker rows.
 */
class PivotService
{
  public:
    /**
     * @brief List pivots for a user.
     * @param userId  UUID of the authenticated user.
     * @param ok      Called with JSON array on success.
     * @param err     Called with status + msg on error.
     */
    void listPivots(
        const std::string& userId,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Create a new pivot record.
     * @param userId  UUID of the authenticated user.
     * @param data    Request body with pivot fields.
     * @param ok      Called with created row on success.
     * @param err     Called with status + msg on error.
     */
    void createPivot(
        const std::string& userId,
        const json& data,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Update an existing pivot record.
     * @param id      UUID of the pivot to update.
     * @param userId  UUID of the authenticated user.
     * @param data    Fields to update.
     * @param ok      Called with updated row on success.
     * @param err     Called with status + msg on error.
     */
    void updatePivot(
        const std::string& id,
        const std::string& userId,
        const json& data,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Delete a pivot record.
     * @param id      UUID of the pivot to delete.
     * @param userId  UUID of the authenticated user.
     * @param ok      Called with empty JSON on success.
     * @param err     Called with status + msg on error.
     */
    void deletePivot(
        const std::string& id,
        const std::string& userId,
        Callback ok,
        ErrCallback err);

  private:
    /** @brief Convenience accessor for the DB client. */
    static auto db()
    {
        return drogon::app().getDbClient();
    }
};

} // namespace services::pivot
