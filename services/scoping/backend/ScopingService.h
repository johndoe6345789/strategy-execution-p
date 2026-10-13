#pragma once
/**
 * @file ScopingService.h
 * @brief Service for the scoped_features table.
 */

#include "scoping_types.h"
#include <string>

namespace services::scoping
{

/**
 * @brief CRUD service for scoped_features rows.
 */
class ScopingService
{
  public:
    /**
     * @brief List all features for a user,
     *        ordered by ICE score descending.
     * @param userId  UUID of the authenticated user.
     * @param ok      Called with JSON array on success.
     * @param err     Called with status + msg on error.
     */
    void listFeatures(
        const std::string& userId,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Create a new scoped feature.
     * @param userId  UUID of the authenticated user.
     * @param data    Request body with feature fields.
     * @param ok      Called with created row on success.
     * @param err     Called with status + msg on error.
     */
    void createFeature(
        const std::string& userId,
        const json& data,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Update an existing feature.
     * @param id      UUID of the feature to update.
     * @param userId  UUID of the authenticated user.
     * @param data    Fields to update.
     * @param ok      Called with updated row on success.
     * @param err     Called with status + msg on error.
     */
    void updateFeature(
        const std::string& id,
        const std::string& userId,
        const json& data,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Delete a feature.
     * @param id      UUID of the feature to delete.
     * @param userId  UUID of the authenticated user.
     * @param ok      Called with empty JSON on success.
     * @param err     Called with status + msg on error.
     */
    void deleteFeature(
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

} // namespace services::scoping
