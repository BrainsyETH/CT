-- February 27 Crypto History Events
-- Submitted by Pine Valley 🌲 (subagent for Magnolia)

-- Event 1: Mt. Gox Transaction Malleability Explanation Published (2014)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'mtgox-malleability-article-2014-02-27',
  '2014-02-27',
  'Guardian Publishes Deep Dive on Mt. Gox Transaction Malleability Bug',
  'The Guardian published a comprehensive technical breakdown explaining how Bitcoin''s transaction malleability flaw enabled the Mt. Gox collapse. The article detailed how attackers could alter transaction IDs without sender permission, causing Mt. Gox''s flawed accounting to send bitcoins twice. While malleability was a real Bitcoin protocol issue known since 2011, the piece revealed Mt. Gox''s stunning lack of proper auditing and security controls—CEO Mark Karpeles allegedly the only person with cold storage access, no customer deposit audits ever conducted. Crypto Twitter erupted with skepticism, with prominent voices like @Falkvinge calling the malleability excuse "impossible" and suggesting an inside job. Published just one day before Mt. Gox filed bankruptcy, the article became the definitive explanation of the exchange''s technical and operational failures.',
  '{"Centralized Exchange","Security"}',
  '{"FAILURE","SECURITY"}',
  '{"timeline"}',
  'https://cdn.wccftech.com/wp-content/uploads/2014/02/Mt.Gox-logo.png',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/Falkvinge/status/438330125239988224","account_handle":"Falkvinge"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/CoinDesk/status/440773596466520064","account_handle":"CoinDesk"}}]'::jsonb,
  '[{"label":"The Guardian - How a bug in bitcoin led to MtGox''s collapse","url":"https://www.theguardian.com/technology/2014/feb/27/how-does-a-bug-in-bitcoin-lead-to-mtgoxs-collapse"}]'::jsonb,
  '{"btc_price_usd": 550}'::jsonb
);

-- Event 2: SEC Dismisses Coinbase Enforcement Action (2025)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'sec-coinbase-dismissal-2025-02-27',
  '2025-02-27',
  'SEC Drops Coinbase Lawsuit With Prejudice, Marking Major Regulatory Shift',
  'The Securities and Exchange Commission filed a joint stipulation with Coinbase Inc. and Coinbase Global Inc. to dismiss its civil enforcement action against the exchange, with prejudice—permanently closing the case and preventing refiling. The announcement came via SEC press release 2025-47, citing "pending work of the Crypto Task Force" on developing clearer digital asset policy. Crypto Twitter exploded with celebration as the official @SECGov account confirmed the dismissal, with influential accounts like @unusual_whales and @scottmelker amplifying the news. The case closure marked a dramatic regulatory U-turn following the Trump administration''s crypto-friendly stance, part of a broader retreat that included dropping actions against Uniswap, Robinhood, and others. For Coinbase, the victory vindicated its years-long stance that most crypto assets aren''t securities—a foundational CT narrative finally validated by federal regulators.',
  '{"Regulation","Centralized Exchange"}',
  '{"REGULATORY","MILESTONE"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/Gk0wptvXUAAvbax.png',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/SECGov/status/1895509499009511468","account_handle":"SECGov"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/unusual_whales/status/1895223381651275918","account_handle":"unusual_whales"}}]'::jsonb,
  '[{"label":"SEC Press Release 2025-47","url":"https://www.sec.gov/newsroom/press-releases/2025-47"},{"label":"Cozen O''Connor Legal Analysis","url":"https://www.cozen.com/news-resources/news/2025/sec-crypto-2-0-roadmap-of-sec-developments-on-cryptocurrency-and-digital-assets-in-2025"}]'::jsonb,
  '{"btc_price_usd": 0}'::jsonb
);

-- Event 3: Polymarket Insider Trading on ZachXBT Investigation Market (2026)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'polymarket-zachxbt-insider-trading-2026-02-27',
  '2026-02-27',
  'Meta-Scandal: Traders Insider Trade on Polymarket Market About ZachXBT Insider Trading Investigation',
  'In peak CT irony, blockchain sleuth ZachXBT''s February 26 investigation exposing Axiom Exchange employee Broox Bauer for insider trading spawned a Polymarket prediction market worth $40M—which itself became an insider trading bonanza. CoinDesk and on-chain investigators revealed that at least 12 wallets placed heavy bets on "Axiom" as ZachXBT''s target before the reveal, collectively profiting over $1 million. One wallet turned $0.14-per-share entry into $411,000 profit (7x return). LookOnChain and Polysights flagged the suspicious activity, with @coinbureau tweeting the scandal had "$1M made on Polymarket before ZachXBT insider trade case reveal." The meta-layer absurdity—insider trading on an investigation into insider trading—captured CT''s simultaneous genius and dysfunction. As @AndreWGMI noted: "speedrunning trust destruction in crypto." Polymarket faced additional accusations when team affiliate @CarOnPolymarket allegedly profited $12k from early market clarifications.',
  '{"CT Lore","ZachXBT"}',
  '{"CT Lore","CULTURAL"}',
  '{"timeline"}',
  'https://pbs.twimg.com/profile_images/1835710115329667072/4fqTRp7__400x400.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/coinbureau/status/2027309049096896543","account_handle":"coinbureau"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/WuBlockchain/status/2027263385868583331","account_handle":"WuBlockchain"}}]'::jsonb,
  '[{"label":"CoinDesk - Polymarket bettors insider-traded on insider trading market","url":"https://www.coindesk.com/markets/2026/02/27/polymarket-bettors-appear-to-have-insider-traded-on-a-market-designed-to-catch-insider-traders"},{"label":"ZachXBT Investigation Thread","url":"https://x.com/zachxbt/status/2027016064534757659"}]'::jsonb,
  '{"btc_price_usd": 66270}'::jsonb
);
