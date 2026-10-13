#pragma once
/**
 * @file ScopingController.h
 * @brief REST endpoints for scoping domain:
 *        CRUD for scoped features with ICE scoring.
 *        All routes require JwtAuthFilter.
 *        Routes: scoping_routes.h.
 *        Decls: scoping_handler_decls.h
 *        Implementation: ScopingController.cpp
 */

#include "scoping_routes.h"
#include "scoping_handler_decls.h"
#include "scoping/backend/ScopingService.h"

#include <drogon/HttpController.h>

namespace controllers
{

/**
 * @brief Controller for /api/scoping/*.
 *        Implementation is in ScopingController.cpp.
 */
class ScopingController
    : public drogon::HttpController<
          ScopingController>
{
  public:
    METHOD_LIST_BEGIN
    SCOPING_ROUTES(ScopingController)
    METHOD_LIST_END

    SCOPING_HANDLER_DECLS

  private:
    services::scoping::ScopingService svc_;
};

} // namespace controllers
