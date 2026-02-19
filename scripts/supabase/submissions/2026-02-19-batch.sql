-- February 19 Crypto History Events
-- Researched by: Magnolia 🏡 (subagent pine-valley)
-- Date researched: 2026-02-19
-- Target table: events (live site)
--
-- Column types:
--   TEXT ARRAY:  category, tags, mode  → use '{"value"}' syntax
--   JSONB:       media, links, metrics, crimeline → use '...'::jsonb

-- Event 1: Bitcoin Market Cap Hits $1 Trillion for First Time - February 19, 2021
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'btc-1-trillion-market-cap-2021-02-19',
  '2021-02-19',
  'Bitcoin Market Cap Hits $1 Trillion for the First Time',
  'On February 19, 2021, Bitcoin''s market capitalization crossed $1 trillion for the first time in history, with BTC trading around $53,750. Fueled by institutional adoption — Tesla''s $1.5B purchase, MicroStrategy''s continued accumulation, and broader corporate embrace — Bitcoin became just the sixth asset ever to reach a trillion-dollar valuation, joining Apple, Microsoft, Amazon, Alphabet, and Saudi Aramco. CT erupted in celebration, calling it a validation of Satoshi''s original vision and a permanent shift in how institutions view digital assets.',
  '{"Bitcoin","Market Structure"}',
  '{"MILESTONE","ATH","ECONOMIC"}',
  '{"timeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/TrueCrypto28/status/1362788547321806850","account_handle":"TrueCrypto28"}}]'::jsonb,
  '[{"label":"Business Insider – Bitcoin First Hit $1T Market Cap on Feb 19","url":"https://www.businessinsider.com/bitcoin-price-market-cap-reclaims-1-trillion-ether-cryptocurrency-2021-3"},{"label":"Nasdaq – At $1T BTC Market Cap, MicroStrategy Completes $1.05B Raise","url":"https://www.nasdaq.com/articles/at-$1-trillion-btc-market-cap-microstrategy-completes-$1.05-billion-raise-2021-02-19"},{"label":"Bitcoin Maximalist – Bitcoin Market Cap Smashes $1 Trillion","url":"https://bitcoinmaximalist.net/bitcoin-btc-market-cap-smashes-1-trillion/"}]'::jsonb,
  '{"btc_price_usd": 53750}'::jsonb
);

-- Event 2: Bitcoin Achieves Silver Parity - February 19, 2013
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'btc-silver-parity-2013-02-19',
  '2013-02-19',
  'Bitcoin Achieves Price Parity with an Ounce of Silver',
  'On February 19, 2013, Bitcoin reached parity with a troy ounce of silver for the first time, with both priced around $28–$30. It was a psychological milestone that sent shockwaves through early adopter communities — a decentralized digital currency had just matched the value of a precious metal with thousands of years of monetary history. CT veterans marked the moment as the beginning of Bitcoin''s journey to surpass gold. Just four years later, 1 BTC would be worth more than 1 oz of gold.',
  '{"Bitcoin","Culture"}',
  '{"MILESTONE","CULTURAL","ECONOMIC"}',
  '{"timeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/robustus/status/304000061187190785","account_handle":"robustus"}}]'::jsonb,
  '[{"label":"International Forecaster – Bitcoin Reached Parity With Silver","url":"https://theinternationalforecaster.com/topic/international_forecaster_weekly/bitcoin_reached_parity_with_silver"},{"label":"Bitcoin Wiki – Bitcoin Firsts","url":"https://en.bitcoin.it/wiki/Bitcoin_Firsts"}]'::jsonb,
  '{"btc_price_usd": 28, "silver_spot_usd": 28}'::jsonb
);

-- Event 3: Bitcoin Golden Cross Fires — Pre-Halving Bull Signal - February 19, 2020
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'btc-golden-cross-2020-02-19',
  '2020-02-19',
  'Bitcoin''s Golden Cross Fires, CT Predicts Halving Bull Run',
  'On February 19, 2020, Bitcoin formed a Golden Cross — its 50-day moving average crossed above the 200-day moving average — a classic bull market signal that sent CT into a frenzy. With the May 2020 halving just 82 days away, analysts cited the 2019 Golden Cross that triggered a 170% rally and predicted BTC could reach $26K–$28K by halving day. Though COVID-19 would briefly crush the rally in March, the signal ultimately proved prescient: Bitcoin went on to reach $69K by November 2021. Bitcoin closed at $10,191 intraday before fading, up over 30% YTD at that point.',
  '{"Bitcoin","Market Structure"}',
  '{"MILESTONE","ECONOMIC"}',
  '{"timeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/Cointelegraph/status/1229686499903492096","account_handle":"Cointelegraph"}}]'::jsonb,
  '[{"label":"CoinMarketExpert – Bitcoin Golden Cross Feb 19 2020","url":"https://coinmarketexpert.com/bitcoin-price-analysis/"},{"label":"CoinCodex – Bitcoin Golden Cross History","url":"https://coincodex.com/article/67788/bitcoin-golden-cross/"}]'::jsonb,
  '{"btc_price_usd": 10191}'::jsonb
);
