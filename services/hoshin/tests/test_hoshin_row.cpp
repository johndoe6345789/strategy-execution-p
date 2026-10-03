/**
 * @file test_hoshin_row.cpp
 * @brief Pure-logic tests for Hoshin X-matrix serialisation.
 */

#include <gtest/gtest.h>
#include <nlohmann/json.hpp>
#include <string>

namespace
{
using json = nlohmann::json;

/** Maps horizon to sort order — mirrors SQL CASE. */
int horizonOrder(const std::string& h)
{
    if (h == "vision")       return 0;
    if (h == "breakthrough") return 1;
    return 2;
}

json serializeDate(bool isNull, const std::string& v)
{
    return isNull ? json(nullptr) : json(v);
}

bool strengthValid(const std::string& s)
{
    return s == "strong" || s == "medium" || s == "weak";
}
} // namespace

class HoshinRowTest : public ::testing::Test {};

TEST_F(HoshinRowTest, HorizonOrderIsAscending)
{
    EXPECT_LT(horizonOrder("vision"),
              horizonOrder("breakthrough"));
    EXPECT_LT(horizonOrder("breakthrough"),
              horizonOrder("annual"));
}

TEST_F(HoshinRowTest, VisionOrderIsZero)
{
    EXPECT_EQ(horizonOrder("vision"), 0);
}

TEST_F(HoshinRowTest, AnnualOrderIsTwo)
{
    EXPECT_EQ(horizonOrder("annual"), 2);
}

TEST_F(HoshinRowTest, DateSerializesCorrectly)
{
    // Empty string mirrors NULLIF($N,'')::date in SQL.
    EXPECT_TRUE(serializeDate(true, "").is_null());
    const auto r = serializeDate(false, "2031-01-01");
    EXPECT_EQ(r.get<std::string>(), "2031-01-01");
}

TEST_F(HoshinRowTest, ValidStrengthsAccepted)
{
    EXPECT_TRUE(strengthValid("strong"));
    EXPECT_TRUE(strengthValid("medium"));
    EXPECT_TRUE(strengthValid("weak"));
    EXPECT_FALSE(strengthValid("extreme"));
}

TEST_F(HoshinRowTest, ObjectiveRowHasRequiredFields)
{
    json row;
    row["id"]          = "11000001-0000-0000-0000-000000000001";
    row["horizon"]     = "vision";
    row["target_date"] = nullptr;
    row["sort_order"]  = 0;
    EXPECT_TRUE(row.contains("id"));
    EXPECT_TRUE(row.contains("target_date"));
    EXPECT_TRUE(row["target_date"].is_null());
    EXPECT_EQ(horizonOrder(
        row["horizon"].get<std::string>()), 0);
}

TEST_F(HoshinRowTest, LinkRowStrengthIsValid)
{
    json row;
    row["objective_id"]    = "obj-uuid";
    row["organisation_id"] = "org-uuid";
    row["strength"]        = "strong";
    EXPECT_TRUE(row.contains("objective_id"));
    EXPECT_TRUE(row.contains("organisation_id"));
    EXPECT_TRUE(strengthValid(
        row["strength"].get<std::string>()));
}
