#pragma once
/**
 * @file BowlingController.h
 * @brief REST endpoints for bowling chart.
 *        GET    /api/hoshin/bowling?year=YYYY
 *        POST   /api/hoshin/bowling
 *        DELETE /api/hoshin/bowling/{id}
 *        PUT    /api/hoshin/bowling/{objId}/months
 *        All routes require JwtAuthFilter.
 */

#include "bowling_routes.h"
#include "bowling_handler_decls.h"
#include "hoshin/backend/BowlingStore.h"
#include <drogon/HttpController.h>

namespace controllers
{

/**
 * @brief Controller for /api/hoshin/bowling/* endpoints.
 */
class BowlingController
    : public drogon::HttpController<BowlingController>
{
  public:
    METHOD_LIST_BEGIN
    BOWLING_ROUTES(BowlingController)
    METHOD_LIST_END

    BOWLING_HANDLER_DECLS

  private:
    services::hoshin::BowlingStore svc_;
};

} // namespace controllers
