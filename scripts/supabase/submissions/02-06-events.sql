-- Chain of Events: February 6 Historical Events
-- Research Date: 2026-02-06
-- Agent: Magnolia 🏡
-- Note: Only 2 events found for this date. Additional research recommended for:
--   - Bitcoin/Ethereum price milestones on Feb 6 (various years)
--   - Token launches or mainnet deployments
--   - Crypto Twitter cultural moments
--   - DeFi protocol announcements
--   - Lesser-known NFT drops or meme coin launches

-- Event 1: CryptoPunk #5066 Sale (2023)
INSERT INTO event_submissions (
  status,
  submitted_by_email,
  submitted_by_twitter,
  event_data
) VALUES (
  'pending',
  'agent@magnolia.local',
  '@magnolia_agent',
  '{
    "id": "cryptopunk-5066-sale-2023-02-06",
    "date": "2023-02-06",
    "title": "CryptoPunk #5066 Sold for $1.4M",
    "summary": "CryptoPunk #5066 was sold for 857 ETH ($1.4 million) by Kevin Rose, co-founder of Proof (Moonbirds), to an unknown buyer. The sale marked one of the largest NFT transactions during the early 2023 market rebound, signaling renewed confidence in the NFT market after the 2022 crypto winter. Rose had recently fallen victim to a phishing attack that stole over $1 million in NFTs, and this sale was part of his portfolio rebalancing strategy.",
    "category": ["NFT", "Culture"],
    "tags": ["MARKET", "CULTURAL", "MILESTONE"],
    "mode": ["timeline"],
    "image": "",
    "media": [],
    "links": [
      {
        "label": "Decrypt Article",
        "url": "https://decrypt.co/120767/cryptopunk-bored-ape-nft-market-rebounds"
      },
      {
        "label": "OpenSea Listing",
        "url": "https://opensea.io/assets/ethereum/0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb/5066"
      }
    ],
    "metrics": {
      "eth_price_usd": 1634,
      "sale_price_eth": 857,
      "sale_price_usd": 1400000
    }
  }'::jsonb
);

-- Event 2: Bitcoin Crash Bottom (2018)
INSERT INTO event_submissions (
  status,
  submitted_by_email,
  submitted_by_twitter,
  event_data
) VALUES (
  'pending',
  'agent@magnolia.local',
  '@magnolia_agent',
  '{
    "id": "bitcoin-crash-bottom-2018-02-06",
    "date": "2018-02-06",
    "title": "Bitcoin Completes 65% Crash",
    "summary": "Bitcoin completed a devastating 65% decline from its January 6, 2018 peak, marking the bottom of the 2018 cryptocurrency crash. Starting from the all-time high of $19,783 in December 2017, Bitcoin had fallen to approximately $6,200 by February 6, 2018. This crash was worse than the dot-com bubble''s 78% collapse and signaled the beginning of the crypto winter that would last throughout 2018. The crash affected nearly all cryptocurrencies, with many altcoins losing 80-90% of their value.",
    "category": ["Bitcoin", "Market"],
    "tags": ["MARKET", "CRASH", "MILESTONE"],
    "mode": ["timeline"],
    "image": "",
    "media": [],
    "links": [
      {
        "label": "Wikipedia: Cryptocurrency Bubble",
        "url": "https://en.wikipedia.org/wiki/Cryptocurrency_bubble"
      }
    ],
    "metrics": {
      "btc_price_usd": 6200,
      "peak_price_usd": 19783,
      "decline_percentage": 65
    }
  }'::jsonb
);
