-- Chain of Events: February 7 Submissions
-- Researched: 2026-02-07
-- Researcher: Magnolia (subagent pine-valley)
-- Note: Only 1 event found for this date after extensive research

INSERT INTO event_submissions (
  event_id,
  title,
  summary,
  event_date,
  category,
  tags,
  mode,
  image_url,
  media,
  links,
  metrics,
  source_quality,
  research_notes
) VALUES (
  'mtgox-withdrawals-halt-2014-02-07',
  'Mt. Gox Halts All Bitcoin Withdrawals',
  'Mt. Gox, the world''s largest Bitcoin exchange at the time (handling 70% of all BTC trades), suddenly suspended all Bitcoin withdrawals citing "technical issues" and the need to "obtain a clearer picture of the system." The move triggered widespread panic as rumors of insolvency spread across the Bitcoin community. Two weeks later, on February 24, the exchange suspended all trading, and on February 28, Mt. Gox filed for bankruptcy, revealing 850,000 BTC (~$450 million then, ~$45 billion in 2024) had been stolen. This event marked one of the largest cryptocurrency hacks in history and triggered Bitcoin''s first major bear market, shaking confidence in exchanges and centralized custody.',
  '2014-02-07',
  ARRAY['Bitcoin', 'Exchanges'],
  ARRAY['HACK', 'INSTITUTIONAL', 'REGULATORY'],
  ARRAY['timeline', 'crimeline'],
  '',
  '[
    {
      "type": "video",
      "video": {
        "provider": "",
        "url": "",
        "embed_url": "",
        "poster_url": ""
      }
    },
    {
      "type": "twitter",
      "twitter": {
        "tweet_url": "",
        "account_handle": ""
      }
    }
  ]'::jsonb,
  '[
    {
      "label": "WIRED: After a 10-Year Wait, Mt. Gox Bitcoin Is Finally Being Returned",
      "url": "https://www.wired.com/story/after-a-10-year-wait-mt-gox-bitcoin-is-finally-being-returned/"
    },
    {
      "label": "The Verge: Mt. Gox halts Bitcoin withdrawals",
      "url": "https://www.theverge.com/2014/2/7/5389668/bitcoin-exchange-mt-gox-halts-withdrawals-maintenance"
    }
  ]'::jsonb,
  '{
    "btc_stolen": "850000",
    "usd_value_2014": "450000000",
    "market_share": "70%"
  }'::jsonb,
  'high',
  'Only 1 significant event found for February 7 despite extensive research. Mt. Gox withdrawal halt was a pivotal moment in crypto history, leading to the largest exchange collapse at the time. Research included searches for: altcoin launches, Bitcoin price milestones, regulatory announcements, DeFi/NFT events, Ethereum history, ICOs, and other crypto milestones. No other notable events found for this date between 2009-2024.'
);
