#pragma once
/**
 * @file HoshinController.h
 * @brief REST endpoints for the hoshin domain.
 *        GET/POST /api/hoshin/objectives
 *        DELETE   /api/hoshin/objectives/{id}
 *        GET/POST /api/hoshin/links
 *        DELETE   /api/hoshin/links/{id}
 *        All routes require JwtAuthFilter.
 */

#include "hoshin_routes.h"
#include "hoshin_handler_decls.h"
#include "hoshin/backend/HoshinStore.h"
#include <drogon/HttpController.h>

namespace controllers
{

/**
 * @brief Controller for /api/hoshin/* endpoints.
 */
class HoshinController
    : public drogon::HttpController<HoshinController>
{
  public:
    METHOD_LIST_BEGIN
    HOSHIN_ROUTES(HoshinController)
    METHOD_LIST_END

    HOSHIN_HANDLER_DECLS

  private:
    services::hoshin::HoshinStore svc_;
};

} // namespace controllers
