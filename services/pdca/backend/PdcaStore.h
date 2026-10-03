#pragma once
/**
 * @file PdcaStore.h
 * @brief Async CRUD store for pdca_cycles table.
 */

#include "pdca_types.h"
#include <string>

namespace services::pdca
{

/** @brief Async store for PDCA continuous improvement cycles. */
class PdcaStore
{
  public:
    /**
     * @brief List all PDCA cycles for a user.
     * @param userId UUID of the authenticated user.
     * @param ok     Called with JSON array.
     * @param err    Called with status + message.
     */
    void list(
        const std::string& userId,
        Callback ok, ErrCallback err);

    /**
     * @brief Create a new PDCA cycle.
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
     * @brief Complete the current phase and advance.
     * @param id     UUID of the cycle.
     * @param userId UUID of the authenticated user.
     * @param data   {notes, findings} for the phase.
     * @param ok     Called with updated row JSON.
     * @param err    Called with status + message.
     */
    void completePhase(
        const std::string& id,
        const std::string& userId,
        const json& data,
        Callback ok, ErrCallback err);

    /**
     * @brief Delete a PDCA cycle.
     * @param id     UUID of the cycle.
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

} // namespace services::pdca
