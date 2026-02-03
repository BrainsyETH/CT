-- Event Submissions Batch: 2026-02-03
-- Submitted by: Magnolia (magnolia@brainsy.bot)
-- Events: 7 major crypto events spanning 2010-2022
-- Coverage: Hacks, collapses, technical milestones, cultural moments

-- 1. Bitcoin Pizza Day (May 22, 2010)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "bitcoin-pizza-day-2010-05-22",
    "date": "2010-05-22",
    "title": "Bitcoin Pizza Day - First Real-World BTC Transaction",
    "summary": "Laszlo Hanyecz purchased two Papa John''s pizzas for 10,000 BTC (then worth $41), marking the first documented real-world Bitcoin transaction. This event established Bitcoin''s utility as currency and is commemorated annually as Bitcoin Pizza Day.",
    "category": ["Cultural Moment", "Historical Milestone"],
    "tags": ["CULTURAL", "MILESTONE"],
    "mode": ["timeline"],
    "image": "",
    "media": [{
      "type": "twitter",
      "twitter": {
        "tweet_url": "https://x.com/saylor/status/1528348688996782080",
        "account_handle": "saylor"
      }
    }],
    "links": [
      {
        "label": "Michael Saylor Tweet on Bitcoin Pizza Day",
        "url": "https://x.com/saylor/status/1528348688996782080"
      },
      {
        "label": "Bitcoin Wiki - Laszlo Hanyecz",
        "url": "https://en.bitcoin.it/wiki/Laszlo_Hanyecz"
      }
    ],
    "metrics": {
      "btc_amount": "10000",
      "usd_value_then": "41",
      "usd_value_2024": "~400000000"
    }
  }'::jsonb
);

-- 2. The DAO Hack (June 17, 2016)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "dao-hack-ethereum-hard-fork-2016-06-17",
    "date": "2016-06-17",
    "title": "The DAO Hack Leads to Ethereum Hard Fork",
    "summary": "An attacker exploited a recursive call vulnerability in The DAO smart contract, draining 3.6 million ETH ($60M). The Ethereum community controversially hard forked to reverse the theft, creating Ethereum Classic and sparking the ''code is law'' vs. social consensus debate.",
    "category": ["DeFi Protocol", "Smart Contract Exploit"],
    "tags": ["SECURITY", "FAILURE", "TECH"],
    "mode": ["crimeline"],
    "crimeline_type": "Protocol Exploit",
    "outcome": "Partial recovery",
    "image": "",
    "media": [{
      "type": "twitter",
      "twitter": {
        "tweet_url": "https://x.com/initc3org/status/1933641856572928176",
        "account_handle": "initc3org"
      }
    }],
    "links": [
      {
        "label": "IC3 Tweet on DAO Hack Anniversary",
        "url": "https://x.com/initc3org/status/1933641856572928176"
      },
      {
        "label": "Wikipedia - The DAO",
        "url": "https://en.wikipedia.org/wiki/The_DAO"
      },
      {
        "label": "CoinDesk - How The DAO Hack Changed Ethereum",
        "url": "https://www.coindesk.com/consensus-magazine/2023/05/09/coindesk-turns-10-how-the-dao-hack-changed-ethereum-and-crypto"
      }
    ],
    "metrics": {
      "eth_stolen": "3600000",
      "usd_value": "60000000",
      "attacker": "Unknown"
    }
  }'::jsonb
);

-- 3. Ronin Bridge Hack (March 29, 2022)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "ronin-bridge-axie-infinity-hack-2022-03-29",
    "date": "2022-03-29",
    "title": "Ronin Bridge Hack - $625M Stolen from Axie Infinity",
    "summary": "Hackers (later attributed to North Korea''s Lazarus Group) compromised 5 of 9 Ronin Network validator private keys, draining 173,600 ETH and 25.5M USDC ($625M) from the bridge. The exploit went undetected for 6 days, making it one of the largest DeFi hacks ever.",
    "category": ["Bridge", "Validator Compromise"],
    "tags": ["SECURITY", "FAILURE"],
    "mode": ["crimeline"],
    "crimeline_type": "Bridge Hack",
    "outcome": "Partial recovery",
    "image": "",
    "media": [{
      "type": "twitter",
      "twitter": {
        "tweet_url": "https://x.com/CoinMarketCap/status/1509107668371349506",
        "account_handle": "CoinMarketCap"
      }
    }],
    "links": [
      {
        "label": "CoinMarketCap Tweet on Ronin Hack",
        "url": "https://x.com/CoinMarketCap/status/1509107668371349506"
      },
      {
        "label": "CNN - Axie Infinity Ronin Hack",
        "url": "https://www.cnn.com/2022/03/29/tech/axie-infinity-ronin-hack/index.html"
      },
      {
        "label": "Chainalysis - DPRK Hack Attribution",
        "url": "https://www.chainalysis.com/blog/axie-infinity-ronin-bridge-dprk-hack-seizure/"
      }
    ],
    "metrics": {
      "usd_stolen": "625000000",
      "eth_amount": "173600",
      "usdc_amount": "25500000",
      "attacker": "Lazarus Group (North Korea)",
      "detection_delay_days": "6"
    }
  }'::jsonb
);

-- 4. Terra/Luna UST Death Spiral (May 9, 2022)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "terra-luna-ust-death-spiral-2022-05-09",
    "date": "2022-05-09",
    "title": "Terra/Luna UST Death Spiral - $40B Wiped Out",
    "summary": "Terra''s algorithmic stablecoin UST lost its $1 peg, triggering a hyperinflationary death spiral that crashed LUNA from $80 to near-zero in days. The collapse wiped out $40B in value and triggered crypto contagion affecting Celsius, 3AC, and countless retail investors. Do Kwon''s ''steady lads'' tweet became infamous.",
    "category": ["Stablecoin", "Algorithmic Failure"],
    "tags": ["FAILURE", "ECONOMIC", "CULTURAL"],
    "mode": ["timeline", "crimeline"],
    "crimeline_type": "Other",
    "outcome": "Total loss",
    "image": "",
    "media": [{
      "type": "twitter",
      "twitter": {
        "tweet_url": "https://twitter.com/stablekwon/status/1523918207446790144",
        "account_handle": "stablekwon"
      }
    }],
    "links": [
      {
        "label": "Do Kwon Deploying more capital Tweet",
        "url": "https://twitter.com/stablekwon/status/1523918207446790144"
      },
      {
        "label": "Fortune - Rise and Fall of UST and Luna",
        "url": "https://fortune.com/2022/05/25/do-kwon-terra-ust-luna-followers-insiders-react/"
      },
      {
        "label": "CoinDesk - DAI Will Die Tweet Backfires",
        "url": "https://www.coindesk.com/markets/2022/05/11/dai-will-die-tweet-twisted-back-on-terras-kwon-as-ust-loses-1-peg"
      }
    ],
    "metrics": {
      "market_cap_destroyed": "40000000000",
      "luna_price_before": "80",
      "luna_price_after": "0.0001",
      "victims_south_korea": "280000",
      "kwon_conviction": "15 years prison (2025)"
    }
  }'::jsonb
);

-- 5. Celsius Freezes Withdrawals (June 12, 2022)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "celsius-withdrawals-frozen-2022-06-12",
    "date": "2022-06-12",
    "title": "Celsius Freezes Withdrawals - Bankruptcy Incoming",
    "summary": "Celsius Network abruptly paused all withdrawals, swaps, and transfers, citing ''extreme market conditions.'' The move trapped $4.7B in customer funds. CEO Alex Mashinsky had withdrawn $8M of his own funds weeks earlier while publicly assuring users the platform was safe. Celsius filed for bankruptcy July 13, 2022.",
    "category": ["Lending", "Centralized Exchange"],
    "tags": ["FAILURE", "ECONOMIC", "CULTURAL"],
    "mode": ["timeline", "crimeline"],
    "crimeline_type": "Custody Failure",
    "outcome": "Total loss",
    "image": "",
    "media": [{
      "type": "twitter",
      "twitter": {
        "tweet_url": "https://x.com/CelsiusNetwork/status/1536169010877739009",
        "account_handle": "CelsiusNetwork"
      }
    }],
    "links": [
      {
        "label": "Official Celsius Pause Announcement",
        "url": "https://x.com/CelsiusNetwork/status/1536169010877739009"
      },
      {
        "label": "Wu Blockchain Coverage",
        "url": "https://x.com/WuBlockchain/status/1536171893207617536"
      },
      {
        "label": "DOJ - Mashinsky Guilty Plea",
        "url": "https://www.justice.gov/usao-sdny/pr/celsius-founder-and-former-ceo-alexander-mashinsky-pleads-guilty-multi-billion-dollar"
      }
    ],
    "metrics": {
      "funds_trapped": "4700000000",
      "mashinsky_withdrew": "8000000",
      "bankruptcy_date": "2022-07-13",
      "mashinsky_sentence": "12 years prison (2025)"
    }
  }'::jsonb
);

-- 6. The Ethereum Merge (September 15, 2022)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "ethereum-merge-proof-of-stake-2022-09-15",
    "date": "2022-09-15",
    "title": "The Ethereum Merge - Proof of Stake Transition",
    "summary": "Ethereum successfully transitioned from Proof of Work to Proof of Stake in ''The Merge,'' reducing energy consumption by 99.95%. Years in development, the upgrade was completed without network downtime, marking one of blockchain''s most significant technical achievements.",
    "category": ["Technical Milestone", "Network Upgrade"],
    "tags": ["TECH", "MILESTONE"],
    "mode": ["timeline"],
    "image": "",
    "media": [{
      "type": "twitter",
      "twitter": {
        "tweet_url": "https://x.com/VitalikButerin/status/1570306185391378434",
        "account_handle": "VitalikButerin"
      }
    }],
    "links": [
      {
        "label": "Vitalik And we finalized! Tweet",
        "url": "https://x.com/VitalikButerin/status/1570306185391378434"
      },
      {
        "label": "Cointelegraph - Vitalik Celebrates The Merge",
        "url": "https://cointelegraph.com/news/ethereum-co-founder-vitalik-buterin-celebrates-the-merge-dream-for-years"
      }
    ],
    "metrics": {
      "energy_reduction": "99.95%",
      "development_time_years": "~5",
      "eth_price_at_merge": "~1500"
    }
  }'::jsonb
);

-- 7. FTX Exchange Collapse (November 11, 2022)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "ftx-exchange-collapse-2022-11-11",
    "date": "2022-11-11",
    "title": "FTX Exchange Collapse - SBF''s $8B Fraud",
    "summary": "FTX, the 3rd-largest crypto exchange, collapsed in 8 days after CZ announced Binance would liquidate its FTT holdings. The move exposed an $8B hole in customer funds that SBF had secretly loaned to his trading firm Alameda Research. SBF was arrested, convicted of fraud, and sentenced to 25 years in prison.",
    "category": ["Centralized Exchange", "Fraud"],
    "tags": ["FAILURE", "FRAUD", "REGULATORY", "CULTURAL"],
    "mode": ["timeline", "crimeline"],
    "crimeline_type": "Fraud",
    "outcome": "Total loss",
    "image": "",
    "media": [{
      "type": "twitter",
      "twitter": {
        "tweet_url": "https://twitter.com/cz_binance/status/1589283421704290306",
        "account_handle": "cz_binance"
      }
    }],
    "links": [
      {
        "label": "CZ Tweet That Triggered FTX Collapse",
        "url": "https://twitter.com/cz_binance/status/1589283421704290306"
      },
      {
        "label": "ZachXBT on FTX Creditors",
        "url": "https://x.com/zachxbt/status/1984107747051499893"
      },
      {
        "label": "CoinDesk - 8 Days in November",
        "url": "https://www.coindesk.com/layer2/2022/11/09/8-days-in-november-what-led-to-ftxs-sudden-collapse"
      }
    ],
    "metrics": {
      "customer_funds_missing": "8000000000",
      "ftx_valuation_before": "32000000000",
      "sbf_sentence": "25 years prison",
      "collapse_duration_days": "8"
    }
  }'::jsonb
);
