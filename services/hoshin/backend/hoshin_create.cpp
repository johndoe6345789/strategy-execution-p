/**
 * @file hoshin_create.cpp
 * @brief HoshinStore: create objective + create link.
 */

#include "HoshinStore.h"
#include "hoshin_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::hoshin
{

using drogon::orm::Result;

static const std::string kCreateObjSql =
    "INSERT INTO hoshin_objectives"
    " (user_id,title,description,horizon,"
    "  target_date,sort_order)"
    " VALUES($1::uuid,$2,$3,$4,"
    "  NULLIF($5,'')::date,$6::int)"
    " RETURNING id::text, user_id::text, title,"
    "  description, horizon,"
    "  target_date::text, sort_order,"
    "  created_at::text, updated_at::text";

static const std::string kCreateLinkSql =
    "INSERT INTO hoshin_links"
    " (objective_id, organisation_id, strength)"
    " VALUES($1::uuid, $2::uuid, $3)"
    " RETURNING id::text,"
    "  objective_id::text,"
    "  organisation_id::text, strength";

void HoshinStore::createObjective(
    const std::string& userId,
    const json& data,
    Callback ok, ErrCallback err)
{
    auto title = data.value("title", "");
    auto desc  = data.value("description", "");
    auto hor   = data.value("horizon", "annual");
    auto td    = data.value("target_date", "");
    auto so    = data.value("sort_order", 0);

    db()->execSqlAsync(
        kCreateObjSql,
        [ok](const Result& res) {
            ok(objRowToJson(res[0]));
        },
        [err](
            const drogon::orm::
                DrogonDbException& e) {
            spdlog::error("createObjective: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId, title, desc, hor, td, so);
}

void HoshinStore::createLink(
    const std::string& /*userId*/,
    const json& data,
    Callback ok, ErrCallback err)
{
    auto objId  = data.value("objective_id", "");
    auto orgId  = data.value("organisation_id", "");
    auto str    = data.value("strength", "strong");

    db()->execSqlAsync(
        kCreateLinkSql,
        [ok](const Result& res) {
            ok(linkRowToJson(res[0]));
        },
        [err](
            const drogon::orm::
                DrogonDbException& e) {
            spdlog::error("createLink: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        objId, orgId, str);
}

} // namespace services::hoshin
