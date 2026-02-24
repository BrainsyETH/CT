-- Chain of Events: February 24 History
-- Submitted by Pine Valley 🌲 (subagent) on 2026-02-24

-- Event 1: Mt. Gox Suspended Trading (2014)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'mt-gox-suspended-trading-2014-02-24',
  '2014-02-24',
  'Mt. Gox Suspended Trading',
  'Mt. Gox, once the world''s largest Bitcoin exchange handling over 70% of all BTC trades, suspended all trading operations and took its website offline. The exchange had been experiencing withdrawal issues since early February due to "technical problems," but the sudden halt sparked panic across the crypto community. Four days later, Mt. Gox filed for bankruptcy protection, revealing it had lost approximately 850,000 BTC (around $473 million at the time) through years of undetected theft. This catastrophic collapse marked a watershed moment in crypto history, damaging Bitcoin''s reputation and highlighting the critical importance of exchange security and proper custody practices.',
  '{"Centralized Exchange","Security","Bitcoin"}',
  '{"FAILURE","SECURITY"}',
  '{"timeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/CoinDesk/status/437984913424310272","account_handle":"CoinDesk"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/FT/status/438249367011885056","account_handle":"FT"}}]'::jsonb,
  '[{"label":"CoinCentral: Largest Cryptocurrency Hacks","url":"https://coincentral.com/largest-cryptocurrency-hacks-in-history-how-they-happened/"},{"label":"Wikipedia: Mt. Gox","url":"https://en.wikipedia.org/wiki/Mt._Gox"}]'::jsonb,
  '{"btc_price_usd": 600}'::jsonb
);

-- Event 2: Bitcoin Breaks $1,100, Targets $1,200 (2017)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-1100-rally-2017-02-24',
  '2017-02-24',
  'Bitcoin Breaks $1,100, Targets $1,200',
  'Bitcoin surged past $1,100 and approached $1,170 in late February 2017, marking its longest sustained period above the $1,000 threshold since briefly touching that level in early 2014. Major tech outlets like TechCrunch reported the all-time high, while prominent analysts like Willy Woo shared valuation metrics comparing Bitcoin''s market cap to transaction volume. Early Bitcoin investor Roger Ver warned about network congestion issues, while journalist John Stossel publicly endorsed BTC at $1,170, calling it his "best investment" and "betting against government." The rally reflected growing mainstream interest and set the stage for Bitcoin''s explosive 2017 bull run that would later reach nearly $20,000.',
  '{"Bitcoin","Market Structure"}',
  '{"MILESTONE","ECONOMIC"}',
  '{"timeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/TechCrunch/status/834992519385600000","account_handle":"TechCrunch"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/JohnStossel/status/834844192748748805","account_handle":"JohnStossel"}}]'::jsonb,
  '[{"label":"NewsBTC Technical Analysis","url":"https://newsbtc.com/2017/02/24/bitcoin-price-technical-analysis-02242017-aiming-1200"},{"label":"Bitbo Bitcoin Price History","url":"https://charts.bitbo.io/price/"}]'::jsonb,
  '{"btc_price_usd": 1170}'::jsonb
);

-- Event 3: Ukraine Accepts Crypto Donations After Russia Invasion (2022)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'ukraine-crypto-donations-2022-02-24',
  '2022-02-24',
  'Ukraine Accepts Crypto Donations as Russia Invades',
  'On the day Russia launched its full-scale invasion of Ukraine, Ukrainian Minister of Digital Transformation Mykhailo Fedorov publicly shared official government wallet addresses for Bitcoin, Ethereum, and USDT donations to support the armed forces. The crypto community responded immediately, with the official wallets receiving over $3.5 million in the first 24 hours alone. Donations poured in from thousands of individuals worldwide, with crypto proving its utility in bypassing traditional financial restrictions during wartime. The Ukrainian government''s embrace of cryptocurrency donations marked an unprecedented moment - the first major wartime use of crypto as a fundraising tool, demonstrating blockchain''s potential for rapid, borderless financial aid in crisis situations.',
  '{"Bitcoin","Ethereum","Regulation"}',
  '{"CULTURAL","ECONOMIC"}',
  '{"timeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/FedorovMykhailo/status/1497594592438497282","account_handle":"FedorovMykhailo"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/Cointelegraph/status/1497791362791460869","account_handle":"Cointelegraph"}}]'::jsonb,
  '[{"label":"CNBC: Ukraine Raises $54M","url":"https://www.cnbc.com/2022/03/03/ukraine-raises-54-million-as-bitcoin-donations-surge-amid-russian-war.html"},{"label":"Forbes: Russian Invasion Changed Ukraine Blockchain Strategy","url":"https://www.forbes.com/sites/stevenehrlich/2022/03/05/crypto-interrupted-how-the-russian-invasion-dramatically-changed-ukraines-blockchain-strategy-to-focus-on-the-war/"}]'::jsonb,
  '{"btc_price_usd": 38000, "total_donations_usd": 3500000}'::jsonb
);
