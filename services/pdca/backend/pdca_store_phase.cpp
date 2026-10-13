/**
 * @file pdca_store_phase.cpp
 * @brief PdcaStore::completePhase — advances the current
 *        PDCA phase and saves notes/findings via JSONB update.
 */

#include "PdcaStore.h"
#include <drogon/orm/Result.h>
#include <spdlog/spdlog.h>

namespace services::pdca
{

using drogon::orm::Result;

void PdcaStore::completePhase(
    const std::string& id, const std::string& uid,
    const json& d, Callback ok, ErrCallback err)
{
    std::string notes    = d.value("notes","");
    std::string findings = d.value("findings","");

    db()->execSqlAsync(
        "UPDATE pdca_cycles SET"
        " plan_phase  = CASE WHEN current_phase='plan'"
        "  THEN jsonb_build_object('completed',true,"
        "   'completed_date',NOW()::date::text,"
        "   'notes',$3,'findings',$4)"
        "  ELSE plan_phase END,"
        " do_phase    = CASE WHEN current_phase='do'"
        "  THEN jsonb_build_object('completed',true,"
        "   'completed_date',NOW()::date::text,"
        "   'notes',$3,'findings',$4)"
        "  ELSE do_phase END,"
        " check_phase = CASE WHEN current_phase='check'"
        "  THEN jsonb_build_object('completed',true,"
        "   'completed_date',NOW()::date::text,"
        "   'notes',$3,'findings',$4)"
        "  ELSE check_phase END,"
        " act_phase   = CASE WHEN current_phase='act'"
        "  THEN jsonb_build_object('completed',true,"
        "   'completed_date',NOW()::date::text,"
        "   'notes',$3,'findings',$4)"
        "  ELSE act_phase END,"
        " current_phase = CASE current_phase"
        "  WHEN 'plan' THEN 'do'"
        "  WHEN 'do'   THEN 'check'"
        "  WHEN 'check' THEN 'act'"
        "  ELSE 'act' END,"
        " status = CASE WHEN current_phase='act'"
        "  THEN 'completed' ELSE status END,"
        " updated_at=NOW()"
        " WHERE id=$1::uuid AND user_id=$2::uuid"
        " RETURNING id::text,current_phase,status,"
        " plan_phase::text,do_phase::text,"
        " check_phase::text,act_phase::text",
        [ok](const Result& res) {
            if (res.empty()) { ok(json::object()); return; }
            const auto& r = res[0];
            ok({{"id",r["id"].as<std::string>()},
                {"current_phase",
                 r["current_phase"].as<std::string>()},
                {"status",r["status"].as<std::string>()},
                {"plan_phase",  json::parse(
                    r["plan_phase"].as<std::string>())},
                {"do_phase",    json::parse(
                    r["do_phase"].as<std::string>())},
                {"check_phase", json::parse(
                    r["check_phase"].as<std::string>())},
                {"act_phase",   json::parse(
                    r["act_phase"].as<std::string>())}});
        },
        [err](const drogon::orm::DrogonDbException& e) {
            spdlog::error("pdca phase: {}", e.base().what());
            err(drogon::k500InternalServerError, e.base().what());
        },
        id, uid, notes, findings);
}

} // namespace services::pdca
