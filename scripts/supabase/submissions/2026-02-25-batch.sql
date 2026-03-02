-- February 25 Crypto History Events
-- Submitted by: Pine Valley 🌲 (subagent)
-- Date: 2026-02-25

-- Event 1: Mt. Gox Goes Completely Dark (2014)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics, crimeline)
VALUES (
  'mt-gox-goes-dark-2014-02-25',
  '2014-02-25',
  'Mt. Gox Goes Completely Dark',
  'On February 25, 2014, Mt. Gox—once the world''s largest Bitcoin exchange handling 70% of all BTC transactions—went completely offline, erasing its entire website and social media presence. A leaked internal document revealed the company had lost 744,408 BTC (approximately $350 million at the time) in an undetected theft spanning years. Bitcoin''s price plummeted 23% from $600 to $418 as the crypto world faced its most catastrophic exchange failure to date. The sudden disappearance marked the beginning of Mt. Gox''s bankruptcy proceedings and years of legal battles for creditor recovery.',
  '{"Centralized Exchange","Security"}',
  '{"FAILURE","SECURITY"}',
  '{"crimeline"}',
  '',
  '[]'::jsonb,
  '[{"label":"Bitcoin Magazine: Mt. Gox Price History","url":"https://bitcoinmagazine.com/guides/bitcoin-price-history"},{"label":"Wikipedia: Mt. Gox Collapse","url":"https://en.wikipedia.org/wiki/Mt._Gox"},{"label":"Bitcoin.it Wiki: Collapse of Mt. Gox","url":"https://en.bitcoin.it/wiki/Collapse_of_Mt._Gox"}]'::jsonb,
  '{"btc_price_usd": 418, "funds_lost_usd": 350000000}'::jsonb,
  '{
    "type": "EXCHANGE HACK",
    "funds_lost_usd": 350000000,
    "victims_estimated": "~127,000 creditors",
    "root_cause": ["Security breach", "Hot wallet compromise", "Transaction malleability exploit"],
    "aftermath": "Mt. Gox filed for bankruptcy on Feb 28, 2014. CEO Mark Karpeles was arrested in 2015. Creditor payouts began in 2021 after 7+ years of legal proceedings. 200,000 BTC were eventually recovered.",
    "status": "Partial recovery"
  }'::jsonb
);

-- Event 2: Ethereum Constantinople/St. Petersburg Hard Fork (2019)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'ethereum-constantinople-fork-2019-02-25',
  '2019-02-25',
  'Ethereum Constantinople & St. Petersburg Hard Fork',
  'Ethereum successfully activated its Constantinople and St. Petersburg hard forks at block 7,280,000 on February 28, 2019 (originally scheduled for February 25). The dual upgrade implemented five Ethereum Improvement Proposals (EIPs) that reduced gas costs for smart contract operations, optimized blockchain performance, and decreased the block reward from 3 ETH to 2 ETH. The fork had been delayed from January after a critical security vulnerability (EIP-1283) was discovered, requiring the additional St. Petersburg fork to disable the flawed code. This upgrade was a crucial stepping stone toward Ethereum''s eventual transition to proof-of-stake.',
  '{"Ethereum","DeFi Protocol"}',
  '{"TECH","MILESTONE"}',
  '{"timeline"}',
  '',
  '[]'::jsonb,
  '[{"label":"CoinDesk: Constantinople Explained","url":"https://www.coindesk.com/markets/2019/02/27/constantinople-incoming-todays-two-ethereum-hard-forks-explained"},{"label":"Blockonomi: Constantinople Rollout","url":"https://blockonomi.com/ethereum-constantinople-rollout/"},{"label":"Cointelegraph: Constantinople Activation","url":"https://cointelegraph.com/news/ethereum-team-lead-constantinople-hard-fork-to-activate-in-late-february"}]'::jsonb,
  '{"eth_price_usd": 140}'::jsonb
);

-- Event 3: Bitcoin Breaks Below $90K After Bybit Hack (2025)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-below-90k-bybit-2025-02-25',
  '2025-02-25',
  'Bitcoin Breaks Below $90K Following Bybit Exploit Fallout',
  'Bitcoin crashed below $90,000 on February 25, 2025—its lowest level since November 18, 2024—following cascading market uncertainty from the Bybit hack and fears over U.S. tariff policies. The price had already dropped 3.07% to $95,086 immediately after Bybit disclosed on February 21 that hackers had drained nearly $1.5 billion from one of its Ethereum cold wallets in one of the largest crypto exchange hacks ever. The breach, combined with broader macroeconomic concerns about trade policy, triggered panic selling and leveraged liquidations across the market. This marked a dramatic reversal from Bitcoin''s January peak of $109,350 during Trump''s inauguration.',
  '{"Bitcoin","Market Structure"}',
  '{"ECONOMIC","SECURITY"}',
  '{"timeline"}',
  '',
  '[]'::jsonb,
  '[{"label":"Bitcoin Magazine: Bitcoin Price History","url":"https://bitcoinmagazine.com/guides/bitcoin-price-history"},{"label":"Coinpedia: Bitcoin Price Crash Analysis","url":"https://coinpedia.org/news/why-bitcoin-ethereum-and-xrp-prices-crashed-today/"}]'::jsonb,
  '{"btc_price_usd": 90000, "weekly_realized_losses_usd": 1930000000}'::jsonb
);
