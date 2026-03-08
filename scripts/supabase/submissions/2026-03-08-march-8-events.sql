-- Events that occurred on March 8 in crypto history
-- Researched by Pine Valley 🌲 (subagent for Magnolia 🏡)
-- Date: March 8, 2026

-- Event 1: Bitcoin Breaks All-Time High - First $69K+ Close (2024)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "bitcoin-breaks-ath-69k-etf-era-2024-03-08",
    "date": "2024-03-08",
    "title": "Bitcoin Shatters All-Time High, Enters Uncharted Territory Above $69K",
    "summary": "On March 8, 2024, Bitcoin officially broke through its November 2021 all-time high of $69,000, trading above $70,000 for the first time in history. This milestone came just two months after the approval of spot Bitcoin ETFs, marking a new era for cryptocurrency. Unlike the 2021 retail-driven peak, this rally was characterized by institutional demand through BlackRock''s IBIT and Fidelity''s FBTC, which continued seeing massive inflows. The breakout validated the ETF-driven bull thesis and signaled that traditional finance had fully embraced Bitcoin as an asset class.",
    "category": ["Bitcoin", "Market Event", "Milestone"],
    "tags": ["ATH", "MILESTONE", "ECONOMIC", "INSTITUTIONAL"],
    "mode": ["timeline"],
    "image": "",
    "media": [],
    "links": [
      {
        "label": "Bitcoin Price History Analysis",
        "url": "https://www.cointracker.io/blog/bitcoin-price-history"
      },
      {
        "label": "99 Bitcoins Historical Data",
        "url": "https://99bitcoins.com/bitcoin/historical-price/"
      }
    ],
    "metrics": {
      "btc_price_usd": 70000
    }
  }'::jsonb
);

-- Event 2: COVID-19 Crash Deepens - Bitcoin $8,700 Five Days Before Capitulation (2020)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "covid-crash-deepens-btc-8700-2020-03-08",
    "date": "2020-03-08",
    "title": "Bitcoin Slides to $8,700 as COVID-19 Panic Spreads",
    "summary": "Bitcoin fell to approximately $8,700 on March 8, 2020, as global markets spiraled amid escalating COVID-19 fears. Oil prices crashed 30% overnight, traditional markets tumbled, and crypto followed suit. This was the calm before the storm - just 4-5 days later, Bitcoin would experience its most violent crash in history, plummeting to $3,800 on \"Black Thursday\" (March 12-13). The March 8 price action represented the final days of relative stability before the pandemic-induced capitulation that would test Bitcoin''s safe haven narrative and set the stage for the 2021 bull run.",
    "category": ["Bitcoin", "Market Event", "Cultural Moment"],
    "tags": ["ECONOMIC", "MILESTONE"],
    "mode": ["timeline"],
    "image": "",
    "media": [],
    "links": [
      {
        "label": "COVID Crypto Crash Analysis",
        "url": "https://blog.ueex.com/politics-and-crypto/the-2020-covid-19-crypto-crash-why-bitcoin-and-ethereum-tanked/"
      },
      {
        "label": "Biggest Bitcoin Crashes",
        "url": "https://www.webopedia.com/crypto/learn/biggest-bitcoin-crashes/"
      }
    ],
    "metrics": {
      "btc_price_usd": 8700
    }
  }'::jsonb
);

-- Event 3: Bitcoin Consolidates After Gold Parity - Building Toward $1,400 (2017)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "bitcoin-post-gold-parity-consolidation-2017-03-08",
    "date": "2017-03-08",
    "title": "Bitcoin Consolidates Around $1,200 After Historic Gold Parity",
    "summary": "Five days after Bitcoin achieved parity with gold ($1,250) on March 3, 2017, the cryptocurrency consolidated around $1,200-$1,300 as markets digested the psychological milestone. This price action represented a healthy correction after the historic achievement and positioned Bitcoin for its next leg up toward $1,400+ in the coming weeks. The gold parity moment had captured global media attention and brought Bitcoin into mainstream financial discourse, with institutional observers beginning to take the \"digital gold\" narrative seriously.",
    "category": ["Bitcoin", "Market Event", "Cultural Moment"],
    "tags": ["MILESTONE", "ECONOMIC", "CULTURAL"],
    "mode": ["timeline"],
    "image": "",
    "media": [],
    "links": [
      {
        "label": "Bitcoin vs Gold 2017 Analysis",
        "url": "https://www.northcrypto.com/learn/blog/cryptocurrency-calendar-important-dates-in-the-history-of-cryptocurrencies"
      }
    ],
    "metrics": {
      "btc_price_usd": 1250
    }
  }'::jsonb
);
