/**
 * @file hoshin_objectives.cpp
 * @brief HoshinStore::listObjectives implementation.
 */

#include "HoshinStore.h"
#include "hoshin_row.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::hoshin
{

using drogon::orm::Result;

static const std::string kListSql =
    "SELECT id::text, user_id::text, title,"
    " description, horizon,"
    " target_date::text, sort_order,"
    " created_at::text, updated_at::text"
    " FROM hoshin_objectives"
    " WHERE user_id=$1::uuid"
    " ORDER BY"
    " CASE horizon"
    "   WHEN 'vision' THEN 0"
    "   WHEN 'breakthrough' THEN 1"
    "   ELSE 2 END,"
    " sort_order";

void HoshinStore::listObjectives(
    const std::string& userId,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        kListSql,
        [ok](const Result& res) {
            json arr = json::array();
            for (const auto& r : res)
                arr.push_back(objRowToJson(r));
            ok(std::move(arr));
        },
        [err](
            const drogon::orm::
                DrogonDbException& e) {
            spdlog::error("listObjectives: {}",
                          e.base().what());
            err(drogon::k500InternalServerError,
                e.base().what());
        },
        userId);
}

} // namespace services::hoshin
