#pragma once
/**
 * @file PdcaController.h
 * @brief Drogon controller for the PDCA domain.
 */

#include <drogon/HttpController.h>
#include "pdca_handler_decls.h"
#include "pdca_routes.h"
#include "pdca/backend/PdcaStore.h"

namespace controllers
{

/**
 * @brief HTTP controller for /api/pdca endpoints.
 *        Manages Plan-Do-Check-Act improvement cycles.
 */
class PdcaController
    : public drogon::HttpController<PdcaController>
{
  public:
    METHOD_LIST_BEGIN
        PDCA_ROUTES(PdcaController)
    METHOD_LIST_END

    PDCA_HANDLER_DECLS

  private:
    services::pdca::PdcaStore svc_;
};

} // namespace controllers
