#pragma once
/**
 * @file OkrStore.h
 * @brief Async store for okr_objectives and
 *        okr_key_results tables.
 */

#include "okr_types.h"
#include <string>

namespace services::okr
{

/** @brief Async CRUD store for OKR management. */
class OkrStore
{
  public:
    /** @brief List objectives (with nested KRs) for user. */
    void listObjectives(
        const std::string& userId,
        Callback ok, ErrCallback err);

    /** @brief Create a new objective. */
    void createObjective(
        const std::string& userId,
        const json& data,
        Callback ok, ErrCallback err);

    /** @brief Delete an objective (cascades KRs). */
    void deleteObjective(
        const std::string& id,
        const std::string& userId,
        Callback ok, ErrCallback err);

    /** @brief Add a key result to an objective. */
    void addKeyResult(
        const std::string& objectiveId,
        const std::string& userId,
        const json& data,
        Callback ok, ErrCallback err);

    /**
     * @brief Update KR current value; recalculates
     *        progress, status, and objective status.
     */
    void updateKeyResult(
        const std::string& krId,
        const std::string& userId,
        double currentValue,
        Callback ok, ErrCallback err);

    /** @brief Delete a key result. */
    void deleteKeyResult(
        const std::string& krId,
        const std::string& userId,
        Callback ok, ErrCallback err);

  private:
    static auto db()
        { return drogon::app().getDbClient(); }
};

} // namespace services::okr
