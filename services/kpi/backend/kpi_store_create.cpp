/**
 * @file kpi_store_create.cpp
 * @brief KpiStore::create implementation.
 */

#include "KpiStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::kpi
{

using drogon::orm::Result;

void KpiStore::create(
    const std::string& uid,
    const json& d,
    Callback ok, ErrCallback err)
{
    double cur = d.value("current_val", 0.0);
    double bas = d.value("baseline", 0.0);
    const std::string trend =
        cur > bas ? "up" : (cur < bas ? "down" : "flat");

    db()->execSqlAsync(
        "INSERT INTO kpi_metrics"
        "(user_id,name,category,baseline,current_val,"
        " target_val,unit,frequency,owner,trend,"
        " last_updated)"
        " VALUES($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())"
        " RETURNING id::text,name,category,baseline,"
        " current_val,target_val,unit,frequency,owner,"
        " trend,status,last_updated::text,created_at::text",
        [ok](const Result& res) {
            const auto& r = res[0];
            ok({{"id",r["id"].as<std::string>()},
                {"name",r["name"].as<std::string>()},
                {"category",r["category"].as<std::string>()},
                {"baseline",r["baseline"].as<double>()},
                {"current_val",r["current_val"].as<double>()},
                {"target_val",r["target_val"].as<double>()},
                {"unit",r["unit"].as<std::string>()},
                {"frequency",r["frequency"].as<std::string>()},
                {"owner",r["owner"].as<std::string>()},
                {"trend",r["trend"].as<std::string>()},
                {"status",r["status"].as<std::string>()}});
        },
        [err](const drogon::orm::DrogonDbException& e) {
            spdlog::error("kpi create: {}", e.base().what());
            err(drogon::k500InternalServerError, e.base().what());
        },
        uid,
        d.value("name",""), d.value("category","strategic"),
        bas, cur, d.value("target_val",0.0),
        d.value("unit",""), d.value("frequency","monthly"),
        d.value("owner",""), trend);
}

} // namespace services::kpi
