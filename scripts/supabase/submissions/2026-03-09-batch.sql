-- Chain of Events submission for 2026-03-09
-- Research date: 2026-03-09
-- Researcher: Brainsy (manual run, Pine Valley agent workspace issues)

INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'silvergate-bank-collapse-2023-03',
  '2023-03-08',
  'Silvergate Bank Announces Shutdown and Liquidation',
  'Silvergate Capital, the crypto-friendly bank that provided critical infrastructure for digital asset firms, announced voluntary liquidation on March 8, 2023. The bank collapsed after massive deposit withdrawals following FTX''s implosion, with customers pulling $8.1 billion in Q4 2022. Silvergate suspended its real-time payment network (SEN) on March 3 and reported being "less than well-capitalized." The voluntary wind-down marked the first domino in the March 2023 banking crisis, preceding Silicon Valley Bank and Signature Bank failures. Major crypto firms like Coinbase, Kraken, and Paxos had already withdrawn their deposits in the days prior.',
  '{"Banking"}',
  '{"COLLAPSE","CONTAGION","REGULATORY"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/FqunsLTXoAIvFyQ.png',
  '[
    {"type":"twitter","twitter":{"tweet_url":"https://x.com/DylanLeClair/status/1633583792945352704","account_handle":"DylanLeClair"}},
    {"type":"twitter","twitter":{"tweet_url":"https://x.com/GoldTelegraph_/status/1633587762829066240","account_handle":"GoldTelegraph_"}},
    {"type":"twitter","twitter":{"tweet_url":"https://x.com/Barchart/status/1633588491874443267","account_handle":"Barchart"}},
    {"type":"twitter","twitter":{"tweet_url":"https://x.com/unusual_whales/status/1637695715915726848","account_handle":"unusual_whales"}},
    {"type":"twitter","twitter":{"tweet_url":"https://x.com/spectatorindex/status/1637795686384291841","account_handle":"spectatorindex"}},
    {"type":"twitter","twitter":{"tweet_url":"https://x.com/laurashin/status/1633935458836135936","account_handle":"laurashin"}},
    {"type":"twitter","twitter":{"tweet_url":"https://x.com/AP_Abacus/status/1633583302211694593","account_handle":"AP_Abacus"}}
  ]'::jsonb,
  '[
    {"label":"CNBC Coverage","url":"https://www.cnbc.com/2023/03/08/silvergate-shutting-down-operations-and-liquidating-bank.html"},
    {"label":"CNN Business","url":"https://www.cnn.com/2023/03/08/business/silvergate-winds-down-crypto/index.html"},
    {"label":"Reuters","url":"https://www.reuters.com/technology/crypto-focused-bank-silvergate-plans-wind-down-operations-2023-03-08/"}
  ]'::jsonb,
  '{"btc_price_usd": 22000}'::jsonb
);
