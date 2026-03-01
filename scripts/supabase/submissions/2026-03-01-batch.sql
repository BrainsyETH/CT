-- Chain of Events: March 1 Crypto History
-- Submitted by: Pine Valley 🌲 (subagent)
-- Date: 2026-03-01
-- Note: Tweet sources need manual verification - Grok API had connectivity issues

-- Event 1: Bitcoin Rebounds to $68K Amid Iran Geopolitical Crisis (2026)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-68k-iran-crisis-2026-03-01',
  '2026-03-01',
  'Bitcoin Rebounds to $68K Amid Iran Geopolitical Crisis',
  'Bitcoin surged above $68,000 on March 1, 2026, recovering nearly all of Saturday''s war-driven losses within hours of Iranian state TV confirming that Supreme Leader Ayatollah Ali Khamenei was killed in U.S. and Israeli airstrikes. The cryptocurrency had initially dropped to $63,000 over the weekend as traders exited risk assets during the geopolitical shock, but quickly rebounded as markets priced in potential regime change and a shorter period of regional tension. The roughly $80 billion market cap move happened on thin Sunday liquidity, driven by a single headline, demonstrating Bitcoin''s dual role as both a risk-sensitive asset and a 24/7 liquid market where traders adjust positions when traditional markets are closed.',
  '{"Bitcoin","Market Structure"}',
  '{"ECONOMIC","MILESTONE"}',
  '{"timeline"}',
  'https://cloudfront-us-east-1.images.arcpublishing.com/coindesk/UXLBXRQE4RBINLGMXLDNJFNHNU.jpg',
  '[]'::jsonb,
  '[{"label":"CoinDesk - Bitcoin tops $68,000 after Iran crisis","url":"https://www.coindesk.com/markets/2026/03/01/bitcoin-tops-usd68-000-after-iran-confirms-leader-killed-in-u-s-israel-airstrikes"},{"label":"CoinDesk - Ether, Solana surge as majors recover","url":"https://www.coindesk.com/markets/2026/03/01/ether-solana-xrp-surge-up-to-10-as-majors-recover-saturday-s-war-driven-losses"}]'::jsonb,
  '{"btc_price_usd": 68000, "btc_price_low": 63000}'::jsonb
);

-- Event 2: Bitcoin Surges Past $62K in ETF-Driven March Rally (2024)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-62k-etf-march-2024-03-01',
  '2024-03-01',
  'Bitcoin Surges Past $62K as ETF Inflows Drive March Rally',
  'Bitcoin surged past $62,000 on March 1, 2024, extending its strong February performance as spot Bitcoin ETF inflows continued to drive unprecedented institutional demand. The rally came just six weeks after the launch of the first spot Bitcoin ETFs in the United States, with BlackRock''s iShares Bitcoin Trust (IBIT) leading record inflows. Bitcoin had gained over 40% year-to-date, trading within striking distance of its November 2021 all-time high of $69,000, as markets positioned ahead of the April 2024 halving event. The price action marked a dramatic reversal from the 2022-2023 bear market, with the crypto community celebrating the return to institutional-grade infrastructure through regulated ETF products.',
  '{"Bitcoin","ETFs"}',
  '{"MILESTONE","ECONOMIC"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/GHfj50gacAAAH3I.jpg',
  '[]'::jsonb,
  '[{"label":"CNBC - Bitcoin tops $60,000 in February 2024","url":"https://www.cnbc.com/2024/02/28/bitcoin-jumps-above-60000-for-the-first-time-since-november-2021.html"},{"label":"Reuters - Bitcoin ETF inflows surge","url":"https://www.reuters.com/markets/us/bitcoin-etfs-see-record-inflows-price-nears-record-high-2024-02-29/"}]'::jsonb,
  '{"btc_price_usd": 62000}'::jsonb
);

-- Event 3: Crypto Community Debates Russia Sanctions (2022)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'russia-sanctions-crypto-debate-2022-03-01',
  '2022-03-01',
  'Crypto Community Debates Russia Sanctions and Exchange Bans',
  'As Western sanctions against Russia intensified following the invasion of Ukraine, March 1, 2022, saw intense debates across the crypto industry about cryptocurrency''s role in sanctions evasion. U.S. and European officials raised concerns that Russia could use Bitcoin and other cryptocurrencies to circumvent financial restrictions, putting pressure on exchanges to implement additional measures. Major platforms including Coinbase and Binance faced calls to ban all Russian accounts, though they ultimately declined blanket bans on ordinary citizens while agreeing to block sanctioned individuals. The controversy highlighted crypto''s fundamental ideological tension between financial freedom and regulatory compliance, becoming a defining moment in the industry''s evolving relationship with governments.',
  '{"Bitcoin","Regulation"}',
  '{"REGULATORY","CULTURAL"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/FMrCKDmXIAEdM4h.jpg',
  '[]'::jsonb,
  '[{"label":"Reuters - Crypto exchanges reject blanket Russia ban","url":"https://www.reuters.com/technology/crypto-exchanges-reject-calls-blanket-ban-russian-users-2022-02-28/"},{"label":"CoinDesk - Ukraine crisis tests crypto values","url":"https://www.coindesk.com/policy/2022/03/01/ukraine-russia-crisis-tests-crypto-values"}]'::jsonb,
  '{"btc_price_usd": 43200}'::jsonb
);
