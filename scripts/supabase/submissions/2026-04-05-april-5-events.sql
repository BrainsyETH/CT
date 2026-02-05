-- Event Submissions Batch: 2026-04-05
-- Submitted by: Magnolia (magnolia@brainsy.bot)
-- Events: 2 April 5 historical events
-- Coverage: Executive Order 6102, Satoshi's symbolic birthday

-- 1. Executive Order 6102 - Gold Confiscation (April 5, 1933)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "executive-order-6102-gold-confiscation-1933-04-05",
    "date": "1933-04-05",
    "title": "Executive Order 6102: FDR Bans Private Gold Ownership",
    "summary": "U.S. President Franklin D. Roosevelt signed Executive Order 6102, requiring all Americans to surrender gold coins, bullion, and certificates to the Federal Reserve or face steep fines and prison. The order remained in effect until 1974, making it illegal to own gold for 41 years. This date became deeply symbolic in crypto culture as representing government monetary overreach.",
    "category": ["Historical Milestone", "Monetary Policy"],
    "tags": ["CULTURAL", "REGULATORY", "HISTORICAL"],
    "mode": ["timeline"],
    "image": "",
    "media": [{
      "type": "twitter",
      "twitter": {
        "tweet_url": "https://x.com/documentingbtc/status/1778462577632227677",
        "account_handle": "documentingbtc"
      }
    }],
    "links": [
      {
        "label": "Executive Order 6102 - Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Executive_Order_6102"
      },
      {
        "label": "CoinDesk - Satoshi''s Birthday and Executive Order 6102",
        "url": "https://www.coindesk.com/policy/2021/04/05/satoshis-birthday-april-5-is-a-day-to-be-thankful-for-bitcoin"
      },
      {
        "label": "Presidential Document Archive",
        "url": "https://www.presidency.ucsb.edu/documents/executive-order-6102-forbidding-the-hoarding-gold-coin-gold-bullion-and-gold-certificates"
      }
    ],
    "metrics": {
      "years_banned": "41",
      "repeal_year": "1974"
    }
  }'::jsonb
);

-- 2. Satoshi's Symbolic Birthday (April 5, 1975)
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'magnolia@brainsy.bot',
  '{
    "id": "satoshi-nakamoto-birthday-1975-04-05",
    "date": "1975-04-05",
    "title": "Satoshi Nakamoto''s Birthday: A Symbolic Choice",
    "summary": "Bitcoin''s creator Satoshi Nakamoto registered April 5, 1975 as his birthday on P2P Foundation, exactly 42 years after Executive Order 6102 banned private gold ownership. The date is widely believed to be deliberately symbolic rather than factual, representing Bitcoin''s mission as confiscation-resistant currency. The crypto community celebrates this date annually as a reminder of Bitcoin''s core values of monetary freedom.",
    "category": ["Cultural Moment", "Historical Milestone"],
    "tags": ["CULTURAL", "MILESTONE", "BITCOIN"],
    "mode": ["timeline"],
    "image": "",
    "media": [{
      "type": "twitter",
      "twitter": {
        "tweet_url": "https://x.com/bitcoin/status/1643653826000953344",
        "account_handle": "bitcoin"
      }
    }],
    "links": [
      {
        "label": "Decrypt - Satoshi''s 50th Birthday",
        "url": "https://decrypt.co/313481/happy-birthday-satoshi-nakamoto-bitcoin"
      },
      {
        "label": "Blockworks - Satoshi Turns 50",
        "url": "https://blockworks.co/news/satoshi-nakamoto-age-birthday-50-clues"
      },
      {
        "label": "P2P Foundation Profile",
        "url": "https://p2pfoundation.net/Satoshi_Nakamoto"
      }
    ],
    "metrics": {
      "years_after_eo6102": "42",
      "btc_held_by_satoshi": "~1000000"
    }
  }'::jsonb
);
