-- February 18 Crypto History Events
-- Researched by: Magnolia 🏡 (subagent pine-valley)
-- Date researched: 2026-02-18
-- Events found: 3

-- Event 1: Christie's Accepts ETH for Beeple NFT Auction - February 18, 2021
INSERT INTO event_submissions (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'christies-beeple-eth-2021-02-18',
  '2021-02-18',
  'Christie''s Becomes First Major Auction House to Accept Crypto',
  'On February 18, 2021, Bloomberg and CNBC reported that Christie''s — one of the world''s oldest and most prestigious auction houses — announced it would accept Ether (ETH) as payment for the landmark Beeple NFT "Everydays: The First 5000 Days." This marked the first time a traditional major auction house accepted cryptocurrency as payment. The NFT auction, running February 25 to March 11, ultimately sold for $69.3 million — making Beeple the third most expensive living artist to sell at auction. The moment was a watershed for both NFTs and crypto adoption, signaling mainstream art world legitimacy for digital assets.',
  '["NFT"]',
  '["NFT", "MILESTONE", "CULTURAL"]',
  '["timeline"]',
  '',
  '[{"type":"video","video":{"provider":"","url":"","embed_url":"","poster_url":""}},{"type":"twitter","twitter":{"tweet_url":"","account_handle":""}}]',
  '[{"label":"CNBC – Christie''s to Auction Beeple NFT Art","url":"https://www.cnbc.com/2021/02/18/christies-to-auction-beeple-nft-art-and-will-accept-ether-as-payment.html"},{"label":"Bloomberg – Christie''s Beeple Auction Will Accept Ether","url":"https://www.bloomberg.com/news/articles/2021-02-18/christie-s-beeple-auction-will-accept-ether-cryptocurrency-payment"},{"label":"The Art Newspaper – Christie''s to Accept Cryptocurrency","url":"https://www.theartnewspaper.com/news/christie-s-cryptocurrency"}]',
  '{"btc_price_usd": 52000, "eth_price_usd": 1900, "beeple_final_sale_usd": 69300000}'
);

-- Event 2: FixedFloat Exchange Hacked for $26.1M - February 18, 2024
INSERT INTO event_submissions (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'fixedfloat-hack-2024-02-18',
  '2024-02-18',
  'FixedFloat Exchange Drained of $26.1M in BTC and ETH',
  'On February 18, 2024, the non-KYC cryptocurrency exchange FixedFloat was drained of approximately $26.1 million — 409 BTC (~$21M) and 1,728 ETH (~$4.7M) — in a wallet-drainer attack. Users had reported frozen transactions and missing funds since February 17 before the extent of the breach became clear. The attacker transferred stolen ETH to the eXch exchange and created false trails through HitBTC addresses. FixedFloat confirmed it was an external attack with no insider involvement and stated that no user funds were directly affected, with 30 outstanding orders to be compensated. Web3 security researchers identified it as a likely exploit of smart contract vulnerabilities combined with access control failures. A second hack by the same group occurred in April 2024.',
  '["Security"]',
  '["SECURITY", "HACK", "EXCHANGE"]',
  '["timeline", "crimeline"]',
  '',
  '[{"type":"video","video":{"provider":"","url":"","embed_url":"","poster_url":""}},{"type":"twitter","twitter":{"tweet_url":"https://twitter.com/officer_cia/status/1759410815004799410","account_handle":"officer_cia"}}]',
  '[{"label":"Hackread – FixedFloat Hacked: $26M in BTC, ETH Stolen","url":"https://hackread.com/crypto-exchange-fixedfloat-hacked-btc-eth-stolen/"},{"label":"The Block – FixedFloat Exploited for $26.1M","url":"https://www.theblock.co/post/277959/fixedfloat-appears-to-have-been-exploited-for-26-1-million-in-bitcoin-ether"},{"label":"Halborn – Explained: The FixedFloat Hack","url":"https://www.halborn.com/blog/post/explained-the-fixedfloat-hack-february-2024"}]',
  '{"btc_price_usd": 51000, "funds_lost_usd": 26100000, "btc_stolen": 409, "eth_stolen": 1728}'
);

-- Event 3: FTX Begins $16 Billion Creditor Repayments - February 18, 2025
INSERT INTO event_submissions (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'ftx-repayments-begin-2025-02-18',
  '2025-02-18',
  'FTX Begins $16 Billion Creditor Repayment Process',
  'On February 18, 2025, the collapsed FTX cryptocurrency exchange began distributing $16 billion in repayments to creditors — more than two years after its catastrophic November 2022 collapse caused by founder Sam Bankman-Fried''s misuse of customer funds. Initial payments of $1.2 billion were distributed to the "Convenience Class" of creditors holding claims under $50,000. Payouts began at 10 AM ET, with total repayments expected to exceed $16 billion across multiple distribution phases. Additionally, 11.2 million SOL tokens (~$2.06 billion) were set to unlock on March 1, 2025, from the FTX bankruptcy auction where buyers like Galaxy and Pantera acquired them at $64–$102. The FTX repayments represented one of the largest creditor recovery processes in crypto history.',
  '["Regulatory"]',
  '["REGULATORY", "ECONOMIC", "FRAUD"]',
  '["timeline"]',
  '',
  '[{"type":"video","video":{"provider":"","url":"","embed_url":"","poster_url":""}},{"type":"twitter","twitter":{"tweet_url":"","account_handle":""}}]',
  '[{"label":"The Defiant – FTX Begins $16B Creditor Repayments","url":"https://thedefiant.io/news/markets/ftx-begins-16-billion-creditor-repayments-on-february-18-2025-initial-1-2-claims-464488c3"},{"label":"CryptoCurrencyNewsCast – FTX Exchange Begins $16B Repayment","url":"https://cryptocurrencynewscast.online/ftx-exchange-begins-16-billion-repayment-process"},{"label":"NewsBTC – FTX Payouts Begin","url":"https://www.newsbtc.com/news/bitcoin/bitcoin-response-to-ftx-payouts/"}]',
  '{"btc_price_usd": 97000, "total_repayment_usd": 16000000000, "initial_payout_usd": 1200000000, "convenience_class_threshold_usd": 50000}'
);
