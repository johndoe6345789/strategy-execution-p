#pragma once
/**
 * @file DecisionService.h
 * @brief Service for the decisions table.
 */

#include "decision_types.h"
#include <string>

namespace services::decisions
{

/**
 * @brief CRUD service for decision log rows.
 */
class DecisionService
{
  public:
    /**
     * @brief List decisions for a user, optionally
     *        filtered by search term.
     * @param userId      UUID of the authenticated user.
     * @param searchTerm  ILIKE filter on title/decision.
     * @param ok          Called with JSON array on success.
     * @param err         Called with status + msg on error.
     */
    void listDecisions(
        const std::string& userId,
        const std::string& searchTerm,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Create a new decision.
     * @param userId  UUID of the authenticated user.
     * @param data    Request body with decision fields.
     * @param ok      Called with created row on success.
     * @param err     Called with status + msg on error.
     */
    void createDecision(
        const std::string& userId,
        const json& data,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Update an existing decision.
     * @param id      UUID of the decision to update.
     * @param userId  UUID of the authenticated user.
     * @param data    Fields to update.
     * @param ok      Called with updated row on success.
     * @param err     Called with status + msg on error.
     */
    void updateDecision(
        const std::string& id,
        const std::string& userId,
        const json& data,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Delete a decision.
     * @param id      UUID of the decision to delete.
     * @param userId  UUID of the authenticated user.
     * @param ok      Called with empty JSON on success.
     * @param err     Called with status + msg on error.
     */
    void deleteDecision(
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

} // namespace services::decisions
