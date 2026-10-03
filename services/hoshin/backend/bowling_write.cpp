/// @brief BowlingStore write operations (create/upsert/delete).
#include "BowlingStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::hoshin
{

using drogon::orm::Result;

static auto dbErr(ErrCallback err) {
    return [err](const drogon::orm::DrogonDbException& e) {
        spdlog::error("bowling write: {}", e.base().what());
        err(drogon::k500InternalServerError, e.base().what());
    };
}

void BowlingStore::createObjective(
    const std::string& uid, const json& d,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "INSERT INTO bowling_objectives(user_id,title)"
        " VALUES($1::uuid,$2)"
        " RETURNING id::text,title,sort_order",
        [ok](const Result& res) {
            const auto& r = res[0];
            ok({{"id",r["id"].as<std::string>()},
                {"title",r["title"].as<std::string>()},
                {"sort_order",r["sort_order"].as<int>()},
                {"months",json::array()}});
        },
        dbErr(err), uid, d.value("title",""));
}

void BowlingStore::upsertMonth(
    const std::string& objId, const std::string& uid,
    const json& d, Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "INSERT INTO bowling_months"
        "(objective_id,month,year,status,actual,target)"
        " SELECT $1::uuid,$3::smallint,$4::smallint,$5,$6,$7"
        " FROM bowling_objectives"
        " WHERE id=$1::uuid AND user_id=$2::uuid"
        " ON CONFLICT (objective_id,year,month)"
        " DO UPDATE SET status=EXCLUDED.status,"
        "  actual=EXCLUDED.actual,target=EXCLUDED.target,"
        "  updated_at=NOW()"
        " RETURNING id::text,month,year,status,actual,target",
        [ok](const Result& res) {
            if (res.empty()) { ok(json::object()); return; }
            const auto& r = res[0];
            ok({{"id",r["id"].as<std::string>()},
                {"month",r["month"].as<int>()},
                {"year",r["year"].as<int>()},
                {"status",r["status"].as<std::string>()},
                {"actual",r["actual"].as<double>()},
                {"target",r["target"].as<double>()}});
        },
        dbErr(err), objId, uid,
        d.value("month",1), d.value("year",2025),
        d.value("status","not-started"),
        d.value("actual",0.0), d.value("target",0.0));
}

void BowlingStore::deleteObjective(
    const std::string& id, const std::string& uid,
    Callback ok, ErrCallback err)
{
    db()->execSqlAsync(
        "DELETE FROM bowling_objectives"
        " WHERE id=$1::uuid AND user_id=$2::uuid",
        [ok](const Result&) { ok(json::object()); },
        dbErr(err), id, uid);
}

} // namespace services::hoshin
