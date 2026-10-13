-- Migration: 002_hoshin_seed
-- Domain: hoshin
-- Seeds Hoshin Kanri objectives and X-matrix links
-- for the dev admin user. ON CONFLICT guards keep it idempotent.

INSERT INTO hoshin_objectives
  (id, user_id, title, description, horizon, target_date, sort_order)
VALUES
  ('11000001-0000-0000-0000-000000000001',
   '686aad67-81b6-4052-b895-2b291bed5565',
   'Financial Independence',
   'Replace government benefit income entirely through compounding startup revenue.',
   'vision', '2031-01-01', 0),
  ('11000001-0000-0000-0000-000000000002',
   '686aad67-81b6-4052-b895-2b291bed5565',
   'Reach £1k/month Revenue',
   'Generate at least £1,000/month from one or more Tier 1-2 startups within 18 months.',
   'breakthrough', '2027-12-01', 0),
  ('11000001-0000-0000-0000-000000000003',
   '686aad67-81b6-4052-b895-2b291bed5565',
   'Build Compound Chain to Tier 4',
   'Reinvest profits to fund a Tier 3-4 startup without external funding.',
   'breakthrough', '2028-06-01', 1),
  ('11000001-0000-0000-0000-000000000004',
   '686aad67-81b6-4052-b895-2b291bed5565',
   'Launch First Paid Gig',
   'Generate first £1 from Fiverr or dog walking within 4 weeks.',
   'annual', '2026-06-01', 0),
  ('11000001-0000-0000-0000-000000000005',
   '686aad67-81b6-4052-b895-2b291bed5565',
   'Hit £300/month from Tier 1',
   'Reach £300/month combined from zero-cost startups.',
   'annual', '2026-09-01', 1),
  ('11000001-0000-0000-0000-000000000006',
   '686aad67-81b6-4052-b895-2b291bed5565',
   'Deploy First Compound Investment',
   'Use Tier 1 profits to fund a Tier 2 startup.',
   'annual', '2026-12-01', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO hoshin_links (objective_id, organisation_id, strength)
VALUES
  -- Annual: Launch First Paid Gig
  ('11000001-0000-0000-0000-000000000004',
   '00000001-0000-0000-0000-000000000001', 'strong'),
  ('11000001-0000-0000-0000-000000000004',
   '00000001-0000-0000-0000-000000000005', 'strong'),
  ('11000001-0000-0000-0000-000000000004',
   '00000001-0000-0000-0000-000000000010', 'medium'),
  -- Annual: Hit £300/month from Tier 1
  ('11000001-0000-0000-0000-000000000005',
   '00000001-0000-0000-0000-000000000002', 'strong'),
  ('11000001-0000-0000-0000-000000000005',
   '00000001-0000-0000-0000-000000000007', 'strong'),
  ('11000001-0000-0000-0000-000000000005',
   '00000001-0000-0000-0000-000000000010', 'strong'),
  -- Annual: Deploy First Compound Investment
  ('11000001-0000-0000-0000-000000000006',
   '00000001-0000-0000-0000-000000000006', 'strong'),
  ('11000001-0000-0000-0000-000000000006',
   '00000001-0000-0000-0000-000000000011', 'strong'),
  -- Breakthrough: Reach £1k/month
  ('11000001-0000-0000-0000-000000000002',
   '00000001-0000-0000-0000-000000000007', 'strong'),
  ('11000001-0000-0000-0000-000000000002',
   '00000001-0000-0000-0000-000000000015', 'strong'),
  ('11000001-0000-0000-0000-000000000002',
   '00000001-0000-0000-0000-000000000025', 'medium'),
  -- Breakthrough: Build Compound Chain to Tier 4
  ('11000001-0000-0000-0000-000000000003',
   '00000001-0000-0000-0000-000000000021', 'strong'),
  ('11000001-0000-0000-0000-000000000003',
   '00000001-0000-0000-0000-000000000040', 'medium'),
  -- Vision: Financial Independence
  ('11000001-0000-0000-0000-000000000001',
   '00000001-0000-0000-0000-000000000041', 'strong'),
  ('11000001-0000-0000-0000-000000000001',
   '00000001-0000-0000-0000-000000000044', 'medium'),
  ('11000001-0000-0000-0000-000000000001',
   '00000001-0000-0000-0000-000000000033', 'medium')
ON CONFLICT (objective_id, organisation_id) DO NOTHING;
