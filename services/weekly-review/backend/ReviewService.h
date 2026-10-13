#pragma once
/**
 * @file ReviewService.h
 * @brief Service interface for weekly_reviews table.
 *        Implementations in review_read.cpp and
 *        review_write.cpp.
 */

#include "review_types.h"
#include <string>

namespace services::weekly_review
{

/**
 * @brief Service for weekly reflection records.
 *        Provides list, get-this-week, and upsert.
 */
class ReviewService
{
  public:
    /**
     * @brief List last 12 reviews for a user.
     * @param userId  UUID of the authenticated user.
     * @param ok      Called with JSON array on success.
     * @param err     Called with status + msg on error.
     */
    void listReviews(
        const std::string& userId,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Fetch the current week's review if any.
     * @param userId  UUID of the authenticated user.
     * @param ok      Called with JSON object (or null).
     * @param err     Called with status + msg on error.
     */
    void getThisWeek(
        const std::string& userId,
        Callback ok,
        ErrCallback err);

    /**
     * @brief Upsert this week's review for a user.
     * @param userId    UUID of the authenticated user.
     * @param body      JSON body with review fields.
     * @param ok        Called with saved row on success.
     * @param err       Called with status + msg on error.
     */
    void submitReview(
        const std::string& userId,
        const json& body,
        Callback ok,
        ErrCallback err);

  private:
    /** @brief Convenience DB client accessor. */
    static auto db()
    {
        return drogon::app().getDbClient();
    }
};

} // namespace services::weekly_review
