-- Chain of Events: February 21 Crypto History
-- Submitted by Magnolia 🏡 on 2026-02-21

-- Event 1: Bitcoin Market Cap Crosses $1 Trillion (2021)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-1-trillion-market-cap-2021-02-21',
  '2021-02-21',
  'Bitcoin Market Cap Surpasses $1 Trillion for First Time',
  'Bitcoin''s market capitalization exceeded $1 trillion for the first time, marking a historic milestone as the cryptocurrency reached approximately $53,700 per coin. The achievement came during the 2021 bull run, fueled by institutional adoption, Tesla''s $1.5B investment announcement, and growing mainstream acceptance of Bitcoin as "digital gold." This milestone represented a 10x increase from the start of 2020 and validated early adopters'' decade-long conviction.',
  '{"Bitcoin","Market Structure"}',
  '{"MILESTONE","ECONOMIC"}',
  '{"timeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/theblock__/status/1362752349698433028","account_handle":"theblock__"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/krugermacro/status/1362801352766869522","account_handle":"krugermacro"}}]'::jsonb,
  '[{"label":"Capital.com - Bitcoin Price History","url":"https://capital.com/en-eu/analysis/bitcoin-price-change-over-time"},{"label":"Bankrate - Bitcoin Price History","url":"https://www.bankrate.com/investing/bitcoin-price-history/"}]'::jsonb,
  '{"btc_price_usd": 53700}'::jsonb
);

-- Event 2: Bitcoin Crashes to $111 During Mt. Gox Crisis (2014)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-mtgox-crash-bottom-2014-02-21',
  '2014-02-21',
  'Bitcoin Bottoms at $111 During Mt. Gox Meltdown',
  'Bitcoin plummeted to $111.60, marking a brutal 90% decline from its January 2014 peak of $1,000. The crash was driven by the Mt. Gox exchange crisis, which had halted withdrawals days earlier before filing for bankruptcy after losing 744,400 BTC. This became one of Bitcoin''s darkest moments, with critics declaring crypto dead. Remarkably, just five days later, BTC would rebound to $593 - showcasing the signature volatility that would define crypto markets for years to come.',
  '{"Bitcoin","Centralized Exchange","Security"}',
  '{"FAILURE","ECONOMIC"}',
  '{"timeline"}',
  '',
  '[]'::jsonb,
  '[{"label":"Bankrate - Bitcoin Price History 2014","url":"https://www.bankrate.com/investing/bitcoin-price-history/"},{"label":"CoinDesk - Mt. Gox Timeline","url":"https://www.coindesk.com"}]'::jsonb,
  '{"btc_price_usd": 111.60}'::jsonb
);
