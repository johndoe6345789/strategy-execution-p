#pragma once
/**
 * @file BowlingStore.h
 * @brief Async store for Hoshin Kanri bowling chart tables:
 *        bowling_objectives and bowling_months.
 */

#include "hoshin_types.h"
#include <string>

namespace services::hoshin
{

/** @brief Store for bowling chart objectives and months. */
class BowlingStore
{
  public:
    /**
     * @brief List bowling objectives with 12-month arrays.
     * @param userId UUID of the authenticated user.
     * @param year   4-digit year to filter months.
     * @param ok     Called with JSON array.
     * @param err    Called with status + message.
     */
    void listObjectives(
        const std::string& userId,
        int year,
        Callback ok, ErrCallback err);

    /**
     * @brief Create a new bowling objective.
     * @param userId UUID of the authenticated user.
     * @param data   {title} body.
     * @param ok     Called with created row JSON.
     * @param err    Called with status + message.
     */
    void createObjective(
        const std::string& userId,
        const json& data,
        Callback ok, ErrCallback err);

    /**
     * @brief Upsert a month cell for an objective.
     * @param objId  UUID of the bowling objective.
     * @param userId UUID of the authenticated user.
     * @param data   {month, year, status, actual, target}.
     * @param ok     Called with upserted row JSON.
     * @param err    Called with status + message.
     */
    void upsertMonth(
        const std::string& objId,
        const std::string& userId,
        const json& data,
        Callback ok, ErrCallback err);

    /**
     * @brief Delete a bowling objective (cascades months).
     * @param id     UUID of the objective.
     * @param userId UUID of the authenticated user.
     * @param ok     Called with empty JSON object.
     * @param err    Called with status + message.
     */
    void deleteObjective(
        const std::string& id,
        const std::string& userId,
        Callback ok, ErrCallback err);

  private:
    static auto db()
        { return drogon::app().getDbClient(); }
};

} // namespace services::hoshin
