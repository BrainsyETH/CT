-- March 2 Crypto History Events
-- Submitted by Pine Valley 🌲 (subagent) on 2026-03-02

-- Event 1: Inverse Finance sDOLA Curve LLAMMA Pool Flash Loan Exploit (March 2, 2026)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics, crimeline)
VALUES (
  'inverse-sdola-flash-loan-exploit-2026-03-02',
  '2026-03-02',
  'sDOLA-crvUSD Curve LLAMMA Pool Flash Loan Exploit',
  'An attacker used a ~$30M flash loan to manipulate the oracle price in a sDOLA-crvUSD Curve LLAMMA (LlamaLend) pool, enabling the liquidation of 27 user positions for ~$240K profit. The exploit targeted an improperly configured oracle in an external pool using Inverse Finance''s DOLA/sDOLA tokens. Security firms CertiK and BlockSec confirmed that Inverse Finance''s core contracts were not affected—the root cause was a spot price oracle vulnerability in the Curve pool that allowed atomic manipulation through flash-loan-funded redemption and restaking donations.',
  '{"DeFi Protocol","Security","Lending"}',
  '{"SECURITY","FAILURE"}',
  '{"crimeline"}',
  'https://pbs.twimg.com/media/HCZnLM7aQAAU7QK.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/CertiKAlert/status/2028357255859679743","account_handle":"CertiKAlert"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/Phalcon_xyz/status/2028412515148026265","account_handle":"Phalcon_xyz"}}]'::jsonb,
  '[{"label":"CertiK Alert","url":"https://x.com/CertiKAlert/status/2028357255859679743"},{"label":"BlockSec Analysis","url":"https://x.com/Phalcon_xyz/status/2028412515148026265"},{"label":"Coinpedia Report","url":"https://coinpedia.org/news/crypto-news-today-live-updates-on-march-2-2026/"}]'::jsonb,
  '{"funds_lost_usd": 240000}'::jsonb,
  '{
    "type": "PROTOCOL EXPLOIT",
    "funds_lost_usd": 240000,
    "victims_estimated": "27 users",
    "root_cause": ["Oracle manipulation", "Flash loan attack", "Improper oracle configuration"],
    "aftermath": "Security firms clarified Inverse Finance core contracts unaffected. Exploit targeted external Curve LLAMMA pool with misconfigured spot price oracle.",
    "status": "Total loss"
  }'::jsonb
);

-- Event 2: Marathon Digital Mines Largest Bitcoin Block with Runestone Inscription (March 2, 2024)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'marathon-largest-bitcoin-block-runestone-2024-03-02',
  '2024-03-02',
  'Marathon Mines Largest Bitcoin Block in History with Runestone Inscription',
  'Marathon Digital Holdings mined the largest Bitcoin block ever recorded at 3,990.36 kilobytes using their Slipstream service. The block contained the largest single transaction (3,988.96 KB) and the largest Ordinal inscription ever—a 3.97 MB Runestone image with 25 million pixels created by pseudonymous Ordinals collector @LeonidasNFT. The feat was celebrated across the Bitcoin Ordinals community as a technical milestone that pushed the boundaries of what''s possible in a single block, creating what some called a "shelling point" for future blockchain archaeologists.',
  '{"Bitcoin","NFTs","Culture"}',
  '{"MILESTONE","TECH","CULTURAL"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/GHr0kxVWQAAwZBJ.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/LeonidasNFT/status/1764216092514213988","account_handle":"LeonidasNFT"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/mononautical/status/1764005321578586131","account_handle":"mononautical"}}]'::jsonb,
  '[{"label":"Runestone Inscription","url":"https://www.ord.io/63140674"},{"label":"Bitcoin News Coverage","url":"https://news.bitcoin.com/marathon-mines-record-breaking-4-mb-bitcoin-block-linked-to-runestone-airdrop/"}]'::jsonb,
  '{}'::jsonb
);

-- Event 3: Bitcoin Surpasses Gold Price for First Time (March 2, 2017)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-surpasses-gold-price-first-time-2017-03-02',
  '2017-03-02',
  'Bitcoin Surpasses Gold Price for First Time',
  'Bitcoin''s market price surpassed the spot price of one troy ounce of gold for the first time ever, with BTC reaching approximately $1,252 while gold traded around $1,242 per ounce. This symbolic milestone occurred during Bitcoin''s 2017 bull run to new all-time highs and was widely celebrated across crypto Twitter and reported by mainstream media including CoinDesk, Financial Times, TechCrunch, NBC News, and Engadget. Bitcoin entrepreneur Erik Voorhees called it a "#MeaninglessButCoolStatistic" while others framed it as a "defining moment in monetary history." The parity moment captured the imagination of both crypto enthusiasts and traditional finance observers as a sign of Bitcoin''s growing legitimacy.',
  '{"Bitcoin","Market Structure"}',
  '{"MILESTONE","ECONOMIC","CULTURAL"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/C56_gCzWYAIcCh4.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/CoinDesk/status/837317139803615235","account_handle":"CoinDesk"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/ErikVoorhees/status/837322625147940866","account_handle":"ErikVoorhees"}}]'::jsonb,
  '[{"label":"CoinDesk Breaking News","url":"https://www.coindesk.com/price-bitcoin-now-worth-one-ounce-gold"},{"label":"Financial Times","url":"https://x.com/FT/status/837477656778133505"}]'::jsonb,
  '{"btc_price_usd": 1252}'::jsonb
);
