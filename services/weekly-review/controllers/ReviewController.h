#pragma once
/**
 * @file ReviewController.h
 * @brief REST endpoints for weekly-review domain:
 *        list, this-week, and submit.
 *        All routes require JwtAuthFilter.
 *        Routes: review_routes.h
 *        Decls:  review_handler_decls.h
 *        Impl:   ReviewController.cpp
 */

#include "review_routes.h"
#include "review_handler_decls.h"
#include "weekly-review/backend/ReviewService.h"

#include <drogon/HttpController.h>

namespace controllers
{

/**
 * @brief Controller for /api/reviews/*.
 *        Thin HTTP adapter over ReviewService.
 */
class ReviewController
    : public drogon::HttpController<ReviewController>
{
  public:
    METHOD_LIST_BEGIN
    REVIEW_ROUTES(ReviewController)
    METHOD_LIST_END

    REVIEW_HANDLER_DECLS

  private:
    services::weekly_review::ReviewService svc_;
};

} // namespace controllers
