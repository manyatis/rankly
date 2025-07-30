-- Reset Database Data Script
-- This script will clear all data while preserving the schema structure

-- Delete in order to respect foreign key constraints

-- Clear query results first
DELETE FROM "QueryResult";

-- Clear AI insights
DELETE FROM "AIInsight";

-- Clear ranking history
DELETE FROM "RankingHistory";

-- Clear input history
DELETE FROM "InputHistory";

-- Clear AEO scores
DELETE FROM "AeoScore";

-- Clear competitor relationships
DELETE FROM "Competitor";

-- Clear organization-business relationships
DELETE FROM "OrganizationBusiness";

-- Clear businesses (this will cascade to related records)
DELETE FROM "Business";

-- Clear organizations (but keep the default "My Org" if it exists)
DELETE FROM "Organization" WHERE name != 'My Org';

-- Clear user sessions and accounts (but keep users for authentication)
DELETE FROM "Session";
DELETE FROM "Account";

-- Reset any auto-increment sequences to start fresh
-- Note: PostgreSQL uses sequences for auto-increment fields
SELECT setval(pg_get_serial_sequence('"Business"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"AeoScore"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"InputHistory"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"RankingHistory"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"Competitor"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"OrganizationBusiness"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"QueryResult"', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('"AIInsight"', 'id'), 1, false);

-- Display summary of what was cleared
SELECT 
    'Data Reset Complete!' as status,
    (SELECT COUNT(*) FROM "Business") as businesses_remaining,
    (SELECT COUNT(*) FROM "AeoScore") as aeo_scores_remaining,
    (SELECT COUNT(*) FROM "RankingHistory") as rankings_remaining,
    (SELECT COUNT(*) FROM "Competitor") as competitors_remaining,
    (SELECT COUNT(*) FROM "User") as users_remaining,
    (SELECT COUNT(*) FROM "Organization") as organizations_remaining;