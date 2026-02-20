-- Events for February 20 in Crypto History
-- Submitted by Magnolia 🏡

-- Event 1: Bitcoin Reaches $1,080 in Early 2017 Bull Run (Feb 20, 2017)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-1080-2017-02-20',
  '2017-02-20',
  'Bitcoin Reaches $1,080 in Early 2017 Bull Run',
  'Bitcoin surged to an intraday high of $1,080.59 on Bitstamp and $1,080 on Coinbase on February 20, 2017, marking continued momentum in the early stages of what would become the historic 2017 bull run. The rally represented Bitcoin trading at levels not seen since early 2014, as the cryptocurrency gained mainstream attention and institutional interest began to grow.',
  '{"Bitcoin","Market Structure"}',
  '{"MILESTONE","ECONOMIC"}',
  '{"timeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/BTCticker/status/833818649890869248","account_handle":"BTCticker"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/CoinDesk/status/833768193726496768","account_handle":"CoinDesk"}}]'::jsonb,
  '[{"label":"BTCticker Tweet","url":"https://x.com/BTCticker/status/833818649890869248"},{"label":"CoinDesk Price Index","url":"https://x.com/CoinDesk/status/833768193726496768"}]'::jsonb,
  '{"btc_price_usd": 1080}'::jsonb
);

-- Event 2: Bitcoin Crosses $56,000 Post-Tesla Rally (Feb 20, 2021)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-56k-2021-02-20',
  '2021-02-20',
  'Bitcoin Crosses $56,000 Post-Tesla Rally',
  'Bitcoin crossed $56,000 for the first time on February 20, 2021, trading at $55,781.99 as the post-Tesla rally continued its momentum. Just weeks after Tesla announced its $1.5 billion Bitcoin purchase (now up ~$1B), the cryptocurrency surged toward what would become a $58k all-time high. Crypto Twitter celebrated the milestone as Bitcoin''s market cap approached $1 trillion, with on-chain metrics from Glassnode suggesting the rally still had room to run before reaching euphoric levels.',
  '{"Bitcoin","CT Lore"}',
  '{"MILESTONE","ATH","ECONOMIC"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/Euno4yzXMAMYsPc.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/BTCTN/status/1362869311849078787","account_handle":"BTCTN"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/n3ocortex/status/1362877072302030849","account_handle":"n3ocortex"}}]'::jsonb,
  '[{"label":"BTCTN Announcement","url":"https://x.com/BTCTN/status/1362869311849078787"},{"label":"Glassnode NUPL Analysis","url":"https://x.com/n3ocortex/status/1362877072302030849"}]'::jsonb,
  '{"btc_price_usd": 55782}'::jsonb
);

-- Event 3: BlackRock''s Viral Bitcoin ETF Campaign & Record Inflows (Feb 20, 2024)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'blackrock-etf-campaign-2024-02-20',
  '2024-02-20',
  'BlackRock''s Viral Bitcoin ETF Campaign & Record Inflows',
  'On February 20, 2024, BlackRock released a prominent advertisement for its iShares Bitcoin Trust (IBIT) spot ETF, portraying Bitcoin as a symbol of "progress," which quickly went viral on Crypto Twitter. Bitcoin spot ETFs saw net inflows of approximately $136 million (~2,600 BTC) on that day, with BlackRock''s IBIT leading the charge. Total BTC held across all spot ETFs hit an all-time high of ~728,000 BTC as trading volumes reached $1.9B. The coordinated marketing push from issuers like BlackRock, Grayscale, and ARK Invest signaled institutional crypto adoption had entered a new era, just weeks after the historic January 2024 spot ETF approvals.',
  '{"Bitcoin","ETFs","Market Structure"}',
  '{"MILESTONE","ECONOMIC","CULTURAL"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/GGyQ_BuWcAAkrwL.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/unusual_whales/status/1759984612849799548","account_handle":"unusual_whales"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/WatcherGuru/status/1759995969421967821","account_handle":"WatcherGuru"}}]'::jsonb,
  '[{"label":"Unusual Whales BlackRock Ad","url":"https://x.com/unusual_whales/status/1759984612849799548"},{"label":"Watcher Guru ETF Inflows","url":"https://x.com/WatcherGuru/status/1759995969421967821"}]'::jsonb,
  '{"btc_price_usd": 52000, "amount_usd": 136000000}'::jsonb
);
