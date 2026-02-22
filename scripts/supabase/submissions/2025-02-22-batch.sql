-- February 22 Crypto History Events
-- Submitted by Magnolia 🏡 via pine-valley subagent
-- Date: 2025-02-22

-- Event 1: Bitcoin Crash After ATH (Feb 22, 2021)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-crash-post-ath-2021-02-22',
  '2021-02-22',
  'Bitcoin Crashed 7% to $48K After Historic February Rally',
  'Bitcoin tumbled 7% to below $48,000 on February 22, 2021, marking the first major correction after reaching an all-time high of $58,640 the day before. The crash followed a record-breaking February that saw BTC surge over 50%, driven by institutional adoption from Tesla ($1.5B purchase), MasterCard crypto support, and the launch of North America''s first Bitcoin ETF. Despite the selloff, analysts maintained optimistic long-term forecasts, with MicroStrategy and Square doubling down on BTC purchases during the dip.',
  '{"Bitcoin","Market Structure"}',
  '{"MILESTONE","ECONOMIC"}',
  '{"timeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/RadioSilentplay/status/1363474187298500610","account_handle":"RadioSilentplay"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/CoinDesk/status/1363138963687489542","account_handle":"CoinDesk"}}]'::jsonb,
  '[{"label":"Bitcoin Price Analysis: February 2021 Recap","url":"https://markets.businessinsider.com/currencies/news/bitcoin-price-analysis-february-recap-record-setting-cryptocurrency-2021-2-1030131679"}]'::jsonb,
  '{"btc_price_usd": 48000}'::jsonb
);

-- Event 2: DAO Hacker Identified (Feb 22, 2022)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics, crimeline)
VALUES (
  'dao-hacker-identified-laura-shin-2022-02-22',
  '2022-02-22',
  'Laura Shin Investigation Identifies Toby Hoenisch as Alleged DAO Hacker',
  'Journalist Laura Shin published a bombshell Forbes investigation identifying Toby Hoenisch, ex-CEO of failed ICO TenX, as the likely perpetrator of Ethereum''s infamous 2016 DAO hack. Working with Chainalysis, investigators traced 3.6 million ETH ($11 billion in 2022 value) through a complex laundering scheme involving ETC swaps, Wasabi mixer, and privacy coin Grin. Despite attempts to cover tracks, Hoenisch was exposed via IP leaks without VPN, username patterns on nodes, and email domains. The hack led to Ethereum''s controversial hard fork creating Ethereum Classic.',
  '{"Ethereum","Security","CT Lore"}',
  '{"SECURITY","CT Lore"}',
  '{"crimeline"}',
  '',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/laurashin/status/1496087239037698048","account_handle":"laurashin"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/lawmaster/status/1496092326955003904","account_handle":"lawmaster"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/chainalysis/status/1496087885061181443","account_handle":"chainalysis"}}]'::jsonb,
  '[{"label":"Forbes: Austrian Programmer Likely Stole $11B of Ether","url":"https://www.forbes.com/sites/laurashin/2022/02/22/exclusive-austrian-programmer-and-ex-crypto-ceo-likely-stole-11-billion-of-ether/"},{"label":"CryptoSlate Coverage","url":"https://cryptoslate.com/hes-the-dao-hacker-doxxed-in-new-book/"}]'::jsonb,
  '{"eth_stolen": 3600000}'::jsonb,
  '{
    "type": "PROTOCOL EXPLOIT",
    "funds_lost_usd": 50000000,
    "victims_estimated": "11,000+ DAO investors",
    "root_cause": ["Smart contract reentrancy vulnerability", "No withdrawal limit checks"],
    "aftermath": "Ethereum hard fork created ETC. Hoenisch allegedly laundered via ETC->BTC->mixers->Grin. Identified 6 years later via blockchain forensics. Hoenisch denied involvement and deleted online presence.",
    "status": "Total loss"
  }'::jsonb
);

-- Event 3: BlackRock Institutional Digital Assets Summit (Feb 22, 2024)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'blackrock-digital-assets-summit-2024-02-22',
  '2024-02-22',
  'BlackRock Hosts Institutional Digital Assets Summit',
  'Asset management giant BlackRock ($9 trillion AUM) hosted its Institutional Digital Assets Summit on February 22, 2024, essentially a Bitcoin sales conference for institutional investors. The event promoted their spot Bitcoin ETF (IBIT), which was the best-performing ETF of the year and BlackRock''s only listed digital asset product at the time. IBIT held 129,127 BTC ($6.3 billion), leading all nine new spot Bitcoin ETFs which collectively held 292,362 BTC. The summit underscored growing mainstream adoption of Bitcoin by traditional finance giants just weeks after the historic spot ETF approval.',
  '{"Bitcoin","ETFs"}',
  '{"MILESTONE","ECONOMIC"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/GG4YVLQXgAAHxMJ.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/BitcoinArchive/status/1760372059757052346","account_handle":"BitcoinArchive"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/BitcoinMagazine/status/1761089648065954125","account_handle":"BitcoinMagazine"}}]'::jsonb,
  '[{"label":"BlackRock IBIT ETF Information","url":"https://www.blackrock.com/us/financial-professionals/products/ibit-ishares-bitcoin-trust"}]'::jsonb,
  '{"btc_held_etfs": 292362, "blackrock_ibit_btc": 129127}'::jsonb
);
