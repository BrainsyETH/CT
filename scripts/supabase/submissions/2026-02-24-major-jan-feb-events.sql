-- Major Crypto Events: January-February 2026
-- Submitted by: Magnolia 🏡 (Subagent: pine-valley)
-- Submission Date: 2026-02-24

-- Event 1: John Daghita (Lick) USMS Crypto Theft
-- Date: Mid-January 2026 (exact date ~Jan 25)
-- ZachXBT exposed contractor's son stealing $40-90M from US government seized wallets
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics, crimeline)
VALUES (
  'daghita-usms-theft-2026-01',
  '2026-01-25',
  'John Daghita Steals $40M+ from US Government Crypto Wallets',
  'ZachXBT exposed John Daghita (aka "Lick"), son of CMDSS CEO, for allegedly stealing over $40 million from US Marshals Service seized cryptocurrency wallets. CMDSS held a government contract to manage seized/forfeited crypto assets. Daghita was exposed after flexing wallet control on Telegram, leading to on-chain tracing. The US government launched a formal investigation into the theft, which involved assets from prior hacks including 2016 Bitfinex.',
  '{"ZachXBT","Key Compromise","Centralized Exchange"}',
  '{"SECURITY","FAILURE","CT Lore"}',
  '{"crimeline"}',
  'https://pbs.twimg.com/media/G_g_Y_0XwAAxgvq.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/zachxbt/status/2015430549846777964","account_handle":"zachxbt"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/follis_/status/2015654266728329568","account_handle":"follis_"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/WatcherGuru/status/2016608730255655018","account_handle":"WatcherGuru"}}]'::jsonb,
  '[{"label":"ZachXBT Thread","url":"https://x.com/zachxbt/status/2015430549846777964"}]'::jsonb,
  '{"funds_lost_usd": 40000000}'::jsonb,
  '{
    "type": "CUSTODY FAILURE",
    "funds_lost_usd": 40000000,
    "victims_estimated": "US Government/USMS",
    "root_cause": ["Insider access", "Compromised contractor credentials", "Key compromise"],
    "aftermath": "US government launched investigation. CMDSS took online presence offline. Daghita exposed via Telegram wallet flexing and ZachXBT on-chain analysis.",
    "status": "Ongoing"
  }'::jsonb
);

-- Event 2: Truebit Protocol $26M Integer Overflow Exploit
-- Date: January 8, 2026
-- Classic Solidity overflow bug in 5-year-old unaudited contract
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics, crimeline)
VALUES (
  'truebit-overflow-exploit-2026-01-08',
  '2026-01-08',
  'Truebit Protocol Loses $26M to Integer Overflow Exploit',
  'Truebit Protocol suffered a devastating $26.4 million exploit when attackers discovered an integer overflow vulnerability in a 5-year-old smart contract compiled with Solidity 0.6.10. The vulnerability allowed attackers to mint TRU tokens at near-zero cost by triggering arithmetic overflow in the purchase contract, flooding the market and crashing the token 99%. The exploit highlighted dangers of legacy contracts lacking built-in overflow protection. Funds were laundered through Tornado Cash.',
  '{"DeFi Protocol","Security"}',
  '{"SECURITY","FAILURE","TECH"}',
  '{"crimeline"}',
  'https://pbs.twimg.com/media/G-KVaS_XgAA8ahL.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/pashov/status/2009334293798244626","account_handle":"pashov"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/lookonchain/status/2009303499927154909","account_handle":"lookonchain"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/Truebitprotocol/status/2009328032813850839","account_handle":"Truebitprotocol"}}]'::jsonb,
  '[{"label":"Exploit Transaction","url":"https://etherscan.io/tx/0xcd4755645595094a8ab984d0db7e3b4aabde72a5c87c4f176a030629c47fb014"},{"label":"Pashov Analysis","url":"https://x.com/pashov/status/2009682445847662972"}]'::jsonb,
  '{"funds_lost_usd": 26400000}'::jsonb,
  '{
    "type": "PROTOCOL EXPLOIT",
    "funds_lost_usd": 26400000,
    "victims_estimated": "TRU token holders",
    "root_cause": ["Integer overflow vulnerability", "Old Solidity compiler (v0.6.10)", "Unverified contract", "No overflow protection"],
    "aftermath": "TRU token crashed 99.9% from $0.16 to near zero. All 8,535 ETH laundered through Tornado Cash. Truebit notified law enforcement. Highlighted risks of legacy unaudited contracts.",
    "status": "Total loss"
  }'::jsonb
);

-- Event 3: Step Finance $30M Treasury Hack
-- Date: January 31, 2026
-- Solana DeFi protocol treasury compromised, STEP token crashed 93%
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics, crimeline)
VALUES (
  'step-finance-treasury-hack-2026-01-31',
  '2026-01-31',
  'Step Finance Loses $30M in Treasury Hack',
  'Solana-based DeFi platform Step Finance suffered a $30-40 million treasury breach when executive team devices were compromised during APAC hours on January 31. Attackers unstaked and drained 261,854 SOL from multiple treasury wallets through what the team called a "well-known attack vector." The STEP governance token crashed over 90% following the disclosure. Step Finance recovered approximately $4.7M and assured user funds were unaffected. This marked the third Solana DeFi treasury breach in January 2026.',
  '{"DeFi Protocol","Security"}',
  '{"SECURITY","FAILURE"}',
  '{"crimeline"}',
  'https://pbs.twimg.com/media/G__tOjebEAQt5jt.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/StepFinance_/status/2018379876642804213","account_handle":"StepFinance_"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/solananew/status/2017592007875825681","account_handle":"solananew"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/coinbureau/status/2017632335337033877","account_handle":"coinbureau"}}]'::jsonb,
  '[{"label":"Step Finance Statement","url":"https://x.com/StepFinance_/status/2018379876642804213"},{"label":"Initial Disclosure","url":"https://x.com/StepFinance_/status/2017667403803410554"}]'::jsonb,
  '{"funds_lost_usd": 30000000}'::jsonb,
  '{
    "type": "OTHER",
    "funds_lost_usd": 30000000,
    "victims_estimated": "Step Finance protocol (treasury)",
    "root_cause": ["Compromised executive devices", "Social engineering", "Known attack vector"],
    "aftermath": "STEP token crashed 80-90%. Team recovered $4.7M ($3.7M Remora + $1M other). User funds reported safe. Third Solana DeFi treasury breach in January. Team cooperating with authorities.",
    "status": "Partial recovery"
  }'::jsonb
);

-- Event 4: $2.56B Bitcoin Liquidation Cascade
-- Date: January 31 - February 1, 2026
-- Largest liquidation event since October 2025 crash
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-liquidations-feb-2026',
  '2026-02-01',
  '$2.56 Billion Bitcoin Liquidation Cascade',
  'Bitcoin crashed from ~$88k to below $76k on January 31-February 1, triggering $2.56 billion in leveraged position liquidations in 24 hours—the largest single-day liquidation event since the October 10, 2025 crash that saw $19B wiped out. The cascade was driven by multiple factors: hawkish Fed signals from Trump''s Kevin Warsh Fed chair nomination, thin weekend liquidity, US-Iran geopolitical tensions, and billions in Bitcoin ETF outflows. Over the following week, total liquidations reached $6.7B, with BTC briefly flash-crashing to $75.6k and erasing over $440B in crypto market cap.',
  '{"Market Structure"}',
  '{"ECONOMIC","FAILURE"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/HAEHWVgaAAA_L3x.png',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/coinbureau/status/2017908411283951635","account_handle":"coinbureau"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/_Investinq/status/2018764729523544095","account_handle":"_Investinq"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/coinbureau/status/2018995641184342151","account_handle":"coinbureau"}}]'::jsonb,
  '[{"label":"Reuters: $2.5B Liquidations","url":"https://www.reuters.com/markets/wealth/crypto-market-volatility-triggers-25-billion-bitcoin-liquidations-2026-02-02/"}]'::jsonb,
  '{"btc_price_usd": 76000}'::jsonb
);
