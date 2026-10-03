/**
 * @file hoshin_delete.cpp
 * @brief HoshinStore: delete objective + delete link.
 */

#include "HoshinStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::hoshin
{

using drogon::orm::Result;

static const std::string kDeleteObjSql =
    "DELETE FROM hoshin_objectives"
    " WHERE id=$1::uuid AND user_id=$2::uuid";

static const std::string kDeleteLinkSql =
    "DELETE FROM hoshin_links l"
    " USING hoshin_objectives o"
    " WHERE l.id=$1::uuid"
    "   AND l.objective_id=o.id"
    "   AND o.user_id=$2::uuid";

void HoshinStore::deleteObjective(
    const std::string& id,
    const std::string& userId,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        kDeleteObjSql,
        [ok](const Result&) {
            ok(json::object());
        },
        [err](
            const drogon::orm::
                DrogonDbException& e) {
            spdlog::error("deleteObjective: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        id, userId);
}

void HoshinStore::deleteLink(
    const std::string& id,
    const std::string& userId,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        kDeleteLinkSql,
        [ok](const Result&) {
            ok(json::object());
        },
        [err](
            const drogon::orm::
                DrogonDbException& e) {
            spdlog::error("deleteLink: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        id, userId);
}

} // namespace services::hoshin
