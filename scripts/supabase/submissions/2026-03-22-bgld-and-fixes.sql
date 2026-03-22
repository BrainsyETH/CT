-- New event: Beaniemaxi / BGLD expose
-- Plus fixes for broken image fields on existing events
-- Date: March 22, 2026

-- =============================================================================
-- NEW EVENT: NFTethics Exposes Beaniemaxi (submit for approval)
-- =============================================================================
INSERT INTO event_submissions (submitted_by_email, event_data)
VALUES (
  'claude@brainsy.bot',
  '{
    "id": "beaniemaxi-bgld-nftethics-expose-2022-01-17",
    "date": "2022-01-17",
    "title": "NFTethics Exposes Beaniemaxi as Serial Scammer in 70-Tweet Thread",
    "summary": "Anonymous Twitter account @NFTethics published a devastating 70-tweet thread doxxing influential NFT figure Beaniemaxi (allegedly Charles Moscoe) as a serial scammer, followed by @ProbablyShady''s own 73-tweet thread alleging Beanie siphoned $40M (12,500 ETH) across projects. Beanie had launched Bloot, a parody of Dom Hofmann''s Loot NFTs, in September 2021, airdropping 10,000 BGLD (Based Gold) tokens per holder while promising to ''make it his life mission to integrate $BGLD into everything.'' The token collapsed 99.97% from $1.10 to $0.00036 across $143M in trading volume. Investigators revealed @beaniemaxi was allegedly not one person but a team of professional marketers, and connected him to the failed TokenPay ICO ($22-34M raised, investors got nothing) and Panama Papers-linked entities. Pixel Vault and Wolf Game publicly severed ties, ZachXBT had already named him the #1 worst NFT account to follow citing ''awful takes / BGLD scam,'' and Beanie went silent for most of 2022 before returning with an apology that 65% of CT rejected in a community poll.",
    "category": ["CT Lore", "NFTs", "Security"],
    "tags": ["CULTURAL", "FAILURE"],
    "mode": ["timeline"],
    "image": null,
    "media": [],
    "links": [
      {"label": "NFTethics Thread", "url": "https://threadreaderapp.com/scrolly/1483051289022017538"},
      {"label": "Highsnobiety Expose", "url": "https://www.highsnobiety.com/p/beaniemaxi-nft-crypto-allegations-exposed/"},
      {"label": "BGLD on Etherscan", "url": "https://etherscan.io/token/0xba7970f10d9f0531941dced1dda7ef3016b24e5b"}
    ],
    "metrics": {}
  }'::jsonb
);

-- =============================================================================
-- FIX: Three Arrows Capital - image stored in wrong field ("images" array
-- instead of "image" string). Also remove duplicate link.
-- =============================================================================
UPDATE events
SET
  image = 'https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/blob-2026-01-11%20at%2011.03.02%20AM.png',
  media = '[{"type": "image", "image": {"url": "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/blob-2026-01-11%20at%2011.03.02%20AM.png", "alt": "Three Arrows Capital collapse", "caption": "Three Arrows Capital defaulted on $3.5B in obligations"}}]'::jsonb,
  links = '[{"label": "3AC Collapse", "url": "https://www.coindesk.com/business/2022/07/01/three-arrows-capital-files-for-chapter-15-bankruptcy/"}]'::jsonb
WHERE id = '3ac-default-2022-06-27';

-- =============================================================================
-- FIX: ZKasino - empty string image should be null, remove empty video media,
-- add missing account_handle for belizardd tweet
-- =============================================================================
UPDATE events
SET
  image = NULL,
  media = '[
    {"type": "twitter", "twitter": {"tweet_url": "https://x.com/belizardd/status/1781967178515796123?s=20", "account_handle": "belizardd"}},
    {"type": "twitter", "twitter": {"tweet_url": "https://x.com/zachxbt/status/1864672363754721703?s=20", "account_handle": "ZachXBT"}},
    {"type": "twitter", "twitter": {"tweet_url": "https://x.com/zachxbt/status/1934616622846931249?s=20", "account_handle": "ZachXBT"}}
  ]'::jsonb
WHERE id = 'zkasino-deposits-converted-zkas-2024-04-20';
