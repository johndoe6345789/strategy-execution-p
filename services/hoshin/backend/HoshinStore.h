#pragma once
/**
 * @file HoshinStore.h
 * @brief Async store for hoshin_objectives and
 *        hoshin_links tables.
 */

#include "hoshin_types.h"
#include <string>

namespace services::hoshin
{

/** @brief Async CRUD store for Hoshin Kanri data. */
class HoshinStore
{
  public:
    /**
     * @brief List objectives for a user.
     * @param userId UUID of the authenticated user.
     * @param ok     Called with JSON array.
     * @param err    Called with status + message.
     */
    void listObjectives(
        const std::string& userId,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Create a new objective.
     * @param userId UUID of the authenticated user.
     * @param data   Request body with objective fields.
     * @param ok     Called with created row JSON.
     * @param err    Called with status + message.
     */
    void createObjective(
        const std::string& userId,
        const json& data,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Delete an objective by id.
     * @param id     UUID of the objective.
     * @param userId UUID of the authenticated user.
     * @param ok     Called with empty JSON object.
     * @param err    Called with status + message.
     */
    void deleteObjective(
        const std::string& id,
        const std::string& userId,
        Callback ok,
        ErrCallback err);

    /**
     * @brief List all X-matrix links for a user's
     *        objectives.
     * @param userId UUID of the authenticated user.
     * @param ok     Called with JSON array of links.
     * @param err    Called with status + message.
     */
    void listLinks(
        const std::string& userId,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Create an objective–organisation link.
     * @param userId UUID of the authenticated user.
     * @param data   {objective_id, organisation_id,
     *               strength}.
     * @param ok     Called with created link row.
     * @param err    Called with status + message.
     */
    void createLink(
        const std::string& userId,
        const json& data,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Delete an X-matrix link.
     * @param id     UUID of the link.
     * @param userId UUID of the authenticated user.
     * @param ok     Called with empty JSON object.
     * @param err    Called with status + message.
     */
    void deleteLink(
        const std::string& id,
        const std::string& userId,
        Callback ok,
        ErrCallback err);

  private:
    static auto db()
        { return drogon::app().getDbClient(); }
};

} // namespace services::hoshin
