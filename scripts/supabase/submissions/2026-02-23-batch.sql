-- February 23 Crypto History Events
-- Submitted by Magnolia 🏡 on 2026-02-23

-- Event 1: Bitcoin New ATH (2017) - Breaking 2013 Peak
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-ath-1164-2017-02-23',
  '2017-02-23',
  'Bitcoin Hits New All-Time High at $1,164',
  'Bitcoin surged to a new all-time high of $1,164 on Bitstamp, eclipsing its 2013 peak of ~$1,150. The milestone was driven by growing investor interest amid economic uncertainty and rising adoption. Major outlets including Bloomberg and TechCrunch covered the breakthrough, marking a pivotal moment in Bitcoin''s recovery from the 2014-2015 bear market.',
  '{"Bitcoin","Bull Runs"}',
  '{"ATH","MILESTONE"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/C5XscdUWQAMOw3R.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/Bitstamp/status/834833303786106880","account_handle":"Bitstamp"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/business/status/834937417991860225","account_handle":"business"}}]'::jsonb,
  '[{"label":"TechCrunch: Bitcoin Hits All-Time High","url":"https://techcrunch.com/2017/02/23/the-price-of-bitcoin-just-hit-an-all-time-high/"}]'::jsonb,
  '{"btc_price_usd": 1164}'::jsonb
);

-- Event 2: Mt. Gox CEO Resignation (2014)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'mtgox-karpeles-resignation-2014-02-23',
  '2014-02-23',
  'Mt. Gox CEO Mark Karpelès Resigns from Bitcoin Foundation',
  'Mark Karpelès, CEO of the troubled Mt. Gox exchange, resigned from the Bitcoin Foundation board amid a deepening crisis at the world''s largest Bitcoin exchange. Mt. Gox had been experiencing severe withdrawal issues, and all posts were removed from its Twitter account the same day. The exchange would suspend all trading the following day (Feb 24) and file for bankruptcy shortly after, having lost approximately 850,000 BTC.',
  '{"Centralized Exchange","Security"}',
  '{"FAILURE","REGULATORY"}',
  '{"timeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/bitcoinbase/status/439068347313840129","account_handle":"bitcoinbase"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/cheetahsoul/status/438439069496774656","account_handle":"cheetahsoul"}}]'::jsonb,
  '[{"label":"Wikipedia: Mt. Gox","url":"https://en.wikipedia.org/wiki/Mt._Gox"},{"label":"Bitcoin.it Wiki: Collapse of Mt. Gox","url":"https://en.bitcoin.it/wiki/Collapse_of_Mt._Gox"}]'::jsonb,
  '{"btc_price_usd": 0}'::jsonb
);

-- Event 3: Largest Bitcoin Transaction in History (2024)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'largest-btc-transaction-2024-02-23',
  '2024-02-23',
  'Largest Bitcoin Transaction Ever: 26,139 BTC ($1.35B)',
  'At 16:05:43 UTC, the largest Bitcoin transaction in history was executed: 26,139.39 BTC worth approximately $1.35 billion, with a network fee of just 4,000 sats ($2.06). The transaction demonstrated Bitcoin''s ability to move institutional-scale value with minimal cost. On the same day, Bitcoin also achieved its highest price ever recorded on a February 23rd, showcasing continued price strength and network maturation.',
  '{"Bitcoin","Market Structure"}',
  '{"MILESTONE","TECH"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/GHRg2AwWkAAYCUy.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/MHiesboeck/status/1762490670365757599","account_handle":"MHiesboeck"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/BecauseBitcoin/status/1761463693609517515","account_handle":"BecauseBitcoin"}}]'::jsonb,
  '[{"label":"Blockchain.com Explorer","url":"https://www.blockchain.com/"}]'::jsonb,
  '{"btc_price_usd": 51600, "transaction_amount_btc": 26139.39, "transaction_value_usd": 1347000000, "transaction_fee_sats": 4000}'::jsonb
);
