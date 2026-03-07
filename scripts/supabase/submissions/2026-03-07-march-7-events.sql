-- Events that occurred on March 7 in crypto history
-- Researched by Pine Valley 🌲 (subagent for Magnolia 🏡)
-- Date: March 7, 2026

-- Event 1: COVID-19 Crash Continues - Bitcoin $8,900 Before "Black Thursday" (2020)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "covid-crash-continues-btc-8900-2020-03-07",
    "date": "2020-03-07",
    "title": "Bitcoin Trades at $8,900 as COVID-19 Panic Intensifies",
    "summary": "As global markets reeled from accelerating COVID-19 cases, Bitcoin continued its descent from the previous day''s $9,100. Trading around $8,900 on March 7, 2020, crypto markets were caught in the broader panic selling. Within 5 days, Bitcoin would experience one of its worst crashes in history, plummeting to $3,800 on \"Black Thursday\" March 12-13. This moment tested Bitcoin''s safe haven narrative and marked the beginning of unprecedented central bank intervention that would fuel the 2021 bull run.",
    "category": ["Bitcoin", "Market Event", "Cultural Moment"],
    "tags": ["ECONOMIC", "MILESTONE"],
    "mode": ["timeline"],
    "image": "",
    "media": [],
    "links": [
      {
        "label": "COVID Crypto Crash Analysis",
        "url": "https://blog.ueex.com/politics-and-crypto/the-2020-covid-19-crypto-crash-why-bitcoin-and-ethereum-tanked/"
      }
    ],
    "metrics": {
      "btc_price_usd": 8900
    }
  }'::jsonb
);

-- Event 2: Mt. Gox Withdrawal Halt Anniversary - Crypto Security Evolution (2014)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "mtgox-withdrawal-halt-anniversary-2014-03-07",
    "date": "2014-03-07",
    "title": "Mt. Gox Bankruptcy Aftermath: Community Seeks Answers",
    "summary": "One week after Mt. Gox filed for bankruptcy protection, the crypto community was still reeling from the loss of 850,000 BTC (worth $450 million at the time). On March 7, 2014, investigations intensified as users demanded transparency about what happened to their funds. The Mt. Gox collapse became a watershed moment for cryptocurrency security, leading to improved custody practices, insurance requirements, and the mantra \"not your keys, not your coins.\" Years later, rehabilitation efforts would recover a significant portion of the lost Bitcoin.",
    "category": ["Centralized Exchange", "Security", "Cultural Moment"],
    "tags": ["SECURITY", "CULTURAL", "MILESTONE"],
    "mode": ["timeline"],
    "image": "",
    "media": [],
    "links": [
      {
        "label": "Mt. Gox Timeline",
        "url": "https://www.coindesk.com/markets/2014/02/28/the-rise-and-fall-of-mt-gox/"
      }
    ],
    "metrics": {}
  }'::jsonb
);

-- Event 3: Bitcoin Approaches $70K - New ATH Imminent (2024)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "bitcoin-approaches-70k-ath-imminent-2024-03-07",
    "date": "2024-03-07",
    "title": "Bitcoin Surges Past $67K as New All-Time High Looms",
    "summary": "Riding the wave of institutional ETF demand, Bitcoin broke through $67,000 on March 7, 2024, putting the November 2021 all-time high of $69,000 within reach. BlackRock''s IBIT and Fidelity''s FBTC continued to see massive inflows as traditional finance embraced Bitcoin. Within 48 hours, BTC would shatter its previous ATH, entering uncharted territory and validating the ETF-driven bull thesis. This rally was notably different from 2021 - institutional participants, not retail FOMO, were driving the price action.",
    "category": ["Bitcoin", "Market Event", "Institutional"],
    "tags": ["ATH", "MILESTONE", "ECONOMIC", "INSTITUTIONAL"],
    "mode": ["timeline"],
    "image": "",
    "media": [],
    "links": [
      {
        "label": "Bitcoin 2024 Rally Analysis",
        "url": "https://www.cointracker.io/blog/bitcoin-price-history"
      }
    ],
    "metrics": {
      "btc_price_usd": 67000
    }
  }'::jsonb
);
