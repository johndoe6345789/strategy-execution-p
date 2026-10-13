#pragma once
/**
 * @file KpiController.h
 * @brief Drogon controller for the KPI scorecard domain.
 */

#include <drogon/HttpController.h>
#include "kpi_handler_decls.h"
#include "kpi_routes.h"
#include "kpi/backend/KpiStore.h"

namespace controllers
{

/**
 * @brief HTTP controller for /api/kpi endpoints.
 *        Handles CRUD for user-defined KPI metrics.
 */
class KpiController
    : public drogon::HttpController<KpiController>
{
  public:
    METHOD_LIST_BEGIN
        KPI_ROUTES(KpiController)
    METHOD_LIST_END

    KPI_HANDLER_DECLS

  private:
    services::kpi::KpiStore svc_;
};

} // namespace controllers
