-- February 18 Crypto History Events
-- Researched by: Magnolia 🏡 (subagent pine-valley)
-- Date researched: 2026-02-18
-- Events found: 3
-- Updated: Added real tweet sources via Grok X Search

-- Event 1: Christie's Accepts ETH for Beeple NFT Auction - February 18, 2021
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "christies-beeple-eth-2021-02-18",
    "date": "2021-02-18",
    "title": "Christie''s Becomes First Major Auction House to Accept Crypto",
    "summary": "On February 18, 2021, Christie''s announced it would accept Ether as payment for the landmark Beeple NFT ''Everydays: The First 5000 Days'' — the first time a major traditional auction house accepted cryptocurrency. The NFT ultimately sold for $69.3M on March 11, 2021, making Beeple the third most expensive living artist. A watershed moment for NFT legitimacy.",
    "category": ["NFT"],
    "tags": ["MILESTONE", "CULTURAL"],
    "mode": ["timeline"],
    "image": "https://pbs.twimg.com/media/EuWf2jBXMAEUMst.jpg",
    "media": [
      {
        "type": "twitter",
        "twitter": {
          "tweet_url": "https://x.com/ChristiesInc/status/1362381219816742916",
          "account_handle": "ChristiesInc"
        }
      }
    ],
    "links": [
      {"label": "CNBC – Christie''s to Auction Beeple NFT", "url": "https://www.cnbc.com/2021/02/18/christies-to-auction-beeple-nft-art-and-will-accept-ether-as-payment.html"},
      {"label": "Bloomberg – Christie''s Beeple Auction", "url": "https://www.bloomberg.com/news/articles/2021-02-18/christie-s-beeple-auction-will-accept-ether-cryptocurrency-payment"}
    ],
    "metrics": {"btc_price_usd": 52000, "eth_price_usd": 1900, "beeple_final_sale_usd": 69300000}
  }'::jsonb
);

-- Event 2: FixedFloat Exchange Hacked for $26.1M - February 18, 2024
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "fixedfloat-hack-2024-02-18",
    "date": "2024-02-18",
    "title": "FixedFloat Exchange Drained of $26.1M in BTC and ETH",
    "summary": "On February 18, 2024, non-KYC exchange FixedFloat was drained of 409 BTC (~$21M) and 1,728 ETH (~$4.7M) via a wallet-drainer attack. The attacker routed stolen ETH through the eXch exchange. FixedFloat confirmed external attack with no insider involvement. The same hacker group struck again in April 2024.",
    "category": ["Security"],
    "tags": ["SECURITY", "FAILURE"],
    "mode": ["crimeline"],
    "crimeline": {
      "type": "EXCHANGE HACK",
      "category": "Centralized Exchange",
      "funds_lost": "$26.1 million",
      "outcome_status": "Total loss",
      "root_cause": "External wallet-drainer attack, access control failure",
      "aftermath": "Stolen ETH routed through eXch mixer. Same attacker returned in April 2024 for second hack."
    },
    "image": "https://pbs.twimg.com/media/GGnn-ZUX0AAxMdk.jpg",
    "media": [
      {
        "type": "twitter",
        "twitter": {
          "tweet_url": "https://x.com/officer_secret/status/1759192197704933621",
          "account_handle": "officer_secret"
        }
      }
    ],
    "links": [
      {"label": "The Block – FixedFloat Exploited for $26.1M", "url": "https://www.theblock.co/post/277959/fixedfloat-appears-to-have-been-exploited-for-26-1-million-in-bitcoin-ether"},
      {"label": "Halborn – Explained: The FixedFloat Hack", "url": "https://www.halborn.com/blog/post/explained-the-fixedfloat-hack-february-2024"}
    ],
    "metrics": {"btc_price_usd": 51000, "funds_lost_usd": 26100000, "btc_stolen": 409, "eth_stolen": 1728}
  }'::jsonb
);

-- Event 3: FTX Begins $16 Billion Creditor Repayments - February 18, 2025
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "ftx-creditor-repayment-2025-02-18",
    "date": "2025-02-18",
    "title": "FTX Begins $16B Creditor Repayments — First Distributions Hit Accounts",
    "summary": "Starting February 18, 2025 at 10 AM ET, FTX distributed an initial $1.2B to ''Convenience Class'' creditors (claims under $50K) — more than 2 years after the exchange''s November 2022 collapse. Total planned repayments across all phases exceed $16B, making it one of the largest creditor recoveries in crypto history.",
    "category": ["Centralized Exchange"],
    "tags": ["ECONOMIC", "REGULATORY", "MILESTONE"],
    "mode": ["timeline"],
    "image": "",
    "media": [
      {
        "type": "twitter",
        "twitter": {
          "tweet_url": "https://x.com/AshCrypto/status/1891882145632694330",
          "account_handle": "AshCrypto"
        }
      }
    ],
    "links": [
      {"label": "FTX Recovery Plan", "url": "https://restructuring.ra.kroll.com/FTX"}
    ],
    "metrics": {"initial_distribution_usd": 1200000000, "total_planned_usd": 16000000000}
  }'::jsonb
);
