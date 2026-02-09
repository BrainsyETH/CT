-- February 9 Crypto History Events
-- Researched by: Magnolia 🏡 (subagent pine-valley)
-- Date researched: 2026-02-09
-- Events found: 2

-- Event 1: Bitcoin Reaches $1 (Parity with USD) - February 9, 2011
INSERT INTO event_submissions (
  date,
  title,
  summary,
  category,
  tags,
  mode,
  image,
  media,
  links,
  metrics
) VALUES (
  '2011-02-09',
  'Bitcoin Reaches $1 - Parity with USD',
  'Bitcoin reached $1.00 for the first time, achieving parity with the US Dollar. This milestone occurred roughly two years after Bitcoin''s launch and marked a psychological breakthrough for the cryptocurrency. Forum posts emerged suggesting Bitcoiners worldwide throw "parity parties" to celebrate. This moment validated Bitcoin''s legitimacy as a form of currency and represented a significant cultural milestone in crypto history. At the time, Bitcoin had already been declared "dead" once at $0.23, making this recovery particularly meaningful to early adopters.',
  'milestone',
  ARRAY['bitcoin', 'price-milestone', 'cultural-moment', 'early-bitcoin'],
  'historical',
  '',
  '[{"type": "video", "video": {"url": "", "title": "", "thumbnail": ""}}, {"type": "twitter", "twitter": {"url": "", "author": "", "text": ""}}]'::jsonb,
  ARRAY[
    'https://charts.bitbo.io/price/',
    'https://calendar.bitbo.io/dollar-parity/',
    'https://www.forbes.com/sites/justinoconnell/2019/12/25/the-2010s-in-bitcoin-the-year-2011/',
    'https://coincodex.com/article/13646/11-years-ago-bitcoin-surpassed-1-milestone-for-the-first-time-ever/',
    'https://www.reddit.com/r/Bitcoin/comments/lg9cxh/ten_years_ago_on_february_9_2011_bitcoin_reached/',
    'https://en.bitcoin.it/wiki/2011',
    'https://bitcoinwiki.org/wiki/bitcoin-history'
  ],
  '{
    "price_usd": 1.00,
    "years_after_launch": 2,
    "cultural_impact": "Parity parties celebrated worldwide"
  }'::jsonb
);

-- Event 2: PlayDapp Hack - $36.5M Initial Loss - February 9, 2024
INSERT INTO event_submissions (
  date,
  title,
  summary,
  category,
  tags,
  mode,
  image,
  media,
  links,
  metrics
) VALUES (
  '2024-02-09',
  'PlayDapp Hack - $36.5M Exploit Begins',
  'South Korean blockchain gaming platform PlayDapp suffered a major security breach when an unauthorized wallet minted 200 million PLA tokens worth $36.5 million. The attack occurred at 01:39:23 PM UTC and was believed to result from a private key compromise. The attacker gained minter privileges on the smart contract, allowing them to create tokens out of thin air. This initial exploit escalated over the following days, with an additional 1.59 billion PLA tokens minted, bringing total losses to approximately $290 million over a 4-day period. PlayDapp offered a $1 million white hat bounty for return of funds and requested centralized exchanges suspend deposits. The incident highlighted critical vulnerabilities in access control for token minting functions.',
  'hack',
  ARRAY['hack', 'playdapp', 'gaming', 'nft', 'private-key-compromise', 'smart-contract', 'security'],
  'crimeline',
  '',
  '[{"type": "video", "video": {"url": "", "title": "", "thumbnail": ""}}, {"type": "twitter", "twitter": {"url": "", "author": "", "text": ""}}]'::jsonb,
  ARRAY[
    'https://immunebytes.com/blog/playdapp-exploit-feb-9th-12th-2024-detailed-analysis-report/',
    'https://www.halborn.com/blog/post/explained-the-playdapp-hack-february-2024',
    'https://www.bleepingcomputer.com/news/security/hackers-mint-179-billion-crypto-tokens-from-playdapp-gaming-platform/',
    'https://medium.com/nefture/playdapp-exploit-post-mortem-of-a-290m-heist-f6803349cde8',
    'https://playdapp.medium.com/playdapp-post-mortem-on-the-hacking-incident-361b4ddfb5a1',
    'https://cointelegraph.com/news/playdapp-exploit-continues-4th-day-losses-reaching-290-million',
    'https://www.elliptic.co/blog/crypto-gaming-platform-playdapp-suffers-290-million-breach',
    'https://www.investopedia.com/news/largest-cryptocurrency-hacks-so-far-year/'
  ],
  '{
    "initial_loss_usd": 36500000,
    "total_loss_usd": 290000000,
    "tokens_minted": 200000000,
    "attack_vector": "Private key compromise",
    "white_hat_bounty_usd": 1000000,
    "duration_days": 4
  }'::jsonb
);
