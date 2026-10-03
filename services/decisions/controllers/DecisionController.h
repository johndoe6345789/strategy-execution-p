#pragma once
/**
 * @file DecisionController.h
 * @brief REST endpoints for the decisions domain.
 *        GET/POST /api/decisions
 *        PUT/DELETE /api/decisions/{id}
 *        All routes require JwtAuthFilter.
 *        Routes: dec_routes.h
 *        Decls:  dec_handler_decls.h
 *        Impls:  DecisionController.cpp
 */

#include "dec_routes.h"
#include "dec_handler_decls.h"
#include "decisions/backend/DecisionService.h"
#include <drogon/HttpController.h>

namespace controllers
{

/**
 * @brief Controller for /api/decisions/*.
 */
class DecisionController
    : public drogon::HttpController<
          DecisionController>
{
  public:
    METHOD_LIST_BEGIN
    DEC_ROUTES(DecisionController)
    METHOD_LIST_END

    DEC_HANDLER_DECLS

  private:
    services::decisions::DecisionService svc_;
};

} // namespace controllers
