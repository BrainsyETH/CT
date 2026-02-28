-- Chain of Events: February 28 Crypto History
-- Submitted by: Pine Valley 🌲 (subagent)
-- Date: 2026-02-28

-- Event 1: Mt. Gox Bankruptcy (CRIMELINE)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics, crimeline)
VALUES (
  'mt-gox-bankruptcy-2014-02-28',
  '2014-02-28',
  'Mt. Gox Files for Bankruptcy After 850,000 BTC Disappear',
  'Mt. Gox, once the world''s largest Bitcoin exchange handling over 70% of all BTC transactions, filed for bankruptcy protection in Tokyo after revealing that 850,000 BTC (worth approximately $460 million at the time) had disappeared from its systems. CEO Mark Karpelès issued an apology as the exchange suspended all trading, devastating the early Bitcoin ecosystem and triggering a severe crisis of confidence. The incident became the largest early crypto hack and remains one of the most infamous collapses in cryptocurrency history.',
  '{"Centralized Exchange","Security"}',
  '{"FAILURE","SECURITY"}',
  '{"crimeline"}',
  'https://pbs.twimg.com/media/BhlPRh7CUAEoWB8.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/musalbas/status/439469601223495680","account_handle":"musalbas"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/NPR/status/439466991621570560","account_handle":"NPR"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/Newsweek/status/439471489964711936","account_handle":"Newsweek"}}]'::jsonb,
  '[{"label":"NPR - Mt. Gox Files For Bankruptcy","url":"https://www.npr.org/sections/thetwo-way/2014/02/28/283863219/mtgox-files-for-bankruptcy-nearly-500m-of-bitcoins-lost"},{"label":"WIRED - The Inside Story of Mt. Gox","url":"https://www.wired.com/2014/03/bitcoin-exchange/"}]'::jsonb,
  '{"btc_price_usd": 545, "funds_lost_usd": 460000000}'::jsonb,
  '{
    "type": "EXCHANGE HACK",
    "funds_lost_usd": 460000000,
    "victims_estimated": "~127,000 creditors",
    "root_cause": ["Security breach", "Internal theft suspected", "Hot wallet compromise"],
    "aftermath": "10+ year bankruptcy proceedings. 200,000 BTC later recovered. Creditors began receiving payouts in 2024, worth billions more due to price appreciation.",
    "status": "Partial recovery"
  }'::jsonb
);

-- Event 2: Bitcoin Consolidates Above $1,000 in 2017 Bull Run
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-1179-2017-bull-run-2017-02-28',
  '2017-02-28',
  'Bitcoin Closes at $1,179.97 as 2017 Bull Run Gains Momentum',
  'Bitcoin closed at $1,179.97 on February 28, 2017, marking a significant milestone in the early stages of the legendary 2017 bull run. After breaking above $1,000 for the first time since 2013 in January, Bitcoin consolidated its gains throughout February, up 21.5% for the month. The price action demonstrated growing institutional and retail interest, with crypto Twitter celebrating the return to four-figure prices. This period laid the foundation for Bitcoin''s eventual surge to nearly $20,000 by year-end, driven by unprecedented retail FOMO and mainstream media coverage.',
  '{"Bitcoin","Market Structure"}',
  '{"MILESTONE","ECONOMIC"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/C5XUTLqWAAE21GA.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/charliebilello/status/834806734292127749","account_handle":"charliebilello"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/KimDotcom/status/837856847755292673","account_handle":"KimDotcom"}}]'::jsonb,
  '[{"label":"Bitcoin Price History 2017","url":"https://charts.bitbo.io/price/"},{"label":"CoinDesk - From $900 to $20,000","url":"https://www.coindesk.com/markets/2017/12/29/from-900-to-20000-bitcoins-historic-2017-price-run-revisited"}]'::jsonb,
  '{"btc_price_usd": 1179.97}'::jsonb
);

-- Event 3: Bitcoin Breaks $60,000 for First Time Since November 2021
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-60k-etf-surge-2024-02-28',
  '2024-02-28',
  'Bitcoin Surges Past $60,000 on ETF Inflows, Briefly Touches $64,000',
  'Bitcoin surged above $60,000 on February 28, 2024, for the first time since the November 2021 peak, driven by massive inflows into newly launched spot Bitcoin ETFs. The price briefly touched $64,000 before pulling back, coming within striking distance of its all-time high of $69,000. BlackRock''s iShares Bitcoin Trust had accumulated over $8 billion in assets in just six weeks, while overall ETF demand far exceeded Bitcoin''s daily mining supply. The rally triggered over $260 million in liquidations across long and short positions, highlighting intense market volatility as traders positioned ahead of the April 2024 halving.',
  '{"Bitcoin","ETFs"}',
  '{"MILESTONE","ECONOMIC"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/GHfj50gacAAAH3I.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/gladstein/status/1762833941033398331","account_handle":"gladstein"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/Schuldensuehner/status/1762833504541212862","account_handle":"Schuldensuehner"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/channelstv/status/1762848271448318232","account_handle":"channelstv"}}]'::jsonb,
  '[{"label":"CNBC - Bitcoin surges past $60,000","url":"https://www.cnbc.com/2024/02/28/bitcoin-jumps-above-60000-for-the-first-time-since-november-2021.html"},{"label":"Reuters - ETF Inflows Drive Rally","url":"https://www.reuters.com/technology/bitcoin-climbs-above-45000-first-time-since-april-2022-2024-01-02/"}]'::jsonb,
  '{"btc_price_usd": 60356, "btc_price_high": 64000}'::jsonb
);
