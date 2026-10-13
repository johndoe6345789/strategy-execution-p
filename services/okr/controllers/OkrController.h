#pragma once
/**
 * @file OkrController.h
 * @brief Drogon controller for the OKR domain.
 */

#include <drogon/HttpController.h>
#include "okr_handler_decls.h"
#include "okr_routes.h"
#include "okr/backend/OkrStore.h"

namespace controllers
{

/**
 * @brief HTTP controller for /api/okr endpoints.
 *        Manages objectives and key results.
 */
class OkrController
    : public drogon::HttpController<OkrController>
{
  public:
    METHOD_LIST_BEGIN
        OKR_ROUTES(OkrController)
    METHOD_LIST_END

    OKR_HANDLER_DECLS

  private:
    services::okr::OkrStore svc_;
};

} // namespace controllers
