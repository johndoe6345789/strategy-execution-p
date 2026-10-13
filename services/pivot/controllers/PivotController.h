#pragma once
/**
 * @file PivotController.h
 * @brief REST endpoints for the pivot domain.
 *        GET/POST /api/pivots
 *        PUT/DELETE /api/pivots/{id}
 *        All routes require JwtAuthFilter.
 *        Routes: pivot_routes.h
 *        Decls:  pivot_handler_decls.h
 *        Impls:  PivotController.cpp
 */

#include "pivot_routes.h"
#include "pivot_handler_decls.h"
#include "pivot/backend/PivotService.h"
#include <drogon/HttpController.h>

namespace controllers
{

/**
 * @brief Controller for /api/pivots/*.
 */
class PivotController
    : public drogon::HttpController<
          PivotController>
{
  public:
    METHOD_LIST_BEGIN
    PIVOT_ROUTES(PivotController)
    METHOD_LIST_END

    PIVOT_HANDLER_DECLS

  private:
    services::pivot::PivotService svc_;
};

} // namespace controllers
