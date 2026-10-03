/**
 * @file hoshin_links.cpp
 * @brief HoshinStore::listLinks implementation.
 */

#include "HoshinStore.h"
#include "hoshin_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::hoshin
{

using drogon::orm::Result;

static const std::string kListLinksSql =
    "SELECT l.id::text,"
    " l.objective_id::text,"
    " l.organisation_id::text,"
    " l.strength"
    " FROM hoshin_links l"
    " JOIN hoshin_objectives o"
    "   ON o.id = l.objective_id"
    " WHERE o.user_id = $1::uuid"
    " ORDER BY l.objective_id, l.strength";

void HoshinStore::listLinks(
    const std::string& userId,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        kListLinksSql,
        [ok](const Result& res) {
            json arr = json::array();
            for (const auto& r : res)
                arr.push_back(linkRowToJson(r));
            ok(std::move(arr));
        },
        [err](
            const drogon::orm::
                DrogonDbException& e) {
            spdlog::error("listLinks: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId);
}

} // namespace services::hoshin
