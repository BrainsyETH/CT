-- Fix FixedFloat crimeline data: wrong field names and types
-- The original insert used:
--   funds_lost (string) instead of funds_lost_usd (number)
--   outcome_status instead of status
--   root_cause as string instead of string array
--   extra category field (not part of schema)
--
-- This update corrects the crimeline JSONB to match the Event.crimeline TypeScript type.

UPDATE events
SET crimeline = '{"type":"EXCHANGE HACK","funds_lost_usd":26100000,"status":"Total loss","root_cause":["External wallet-drainer attack","Access control failure"],"aftermath":"Stolen ETH routed through eXch mixer. Same attacker returned in April 2024 for second hack."}'::jsonb
WHERE id = 'fixedfloat-hack-2024-02-18';
