-- March 3 Crypto History Events
-- Submitted by Pine Valley 🌲 (subagent for Magnolia 🏡)
-- Events: Bitcoin $50K recovery 2021, Bitcoin mining difficulty drop 2022, NodeMonkes Ordinals milestone 2024

-- Event 1: Bitcoin Surges Back Above $50K (March 3, 2021)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-50k-recovery-2021-03-03',
  '2021-03-03',
  'Bitcoin Surges Back Above $50K Amid NFT Hype Wave',
  'Bitcoin recovered to $51,607 (+6.6%), marking its highest price in a week after a brief dip. The rally was fueled by a weakening dollar and anticipation of the $1.9T U.S. stimulus package. Meanwhile, the NFT sector exploded with Kings of Leon becoming the first band to release an album as an NFT, and notable sales like the "Homer Pepe" NFT selling for 205 ETH ($320,000). Market conditions showed healthy fundamentals with spot-futures parity, institutional interest, and positive Coinbase premium.',
  '{"Bitcoin","NFTs","Culture"}',
  '{"MILESTONE","CULTURAL"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/EvhuOlyUcAI1qW3.png',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/CoinMarketCap/status/1367042051007774723","account_handle":"CoinMarketCap"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/iamjosephyoung/status/1367012398821904387","account_handle":"iamjosephyoung"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/RollingStone/status/1367140440286363651","account_handle":"RollingStone"}}]'::jsonb,
  '[{"label":"Cointelegraph: Bitcoin hits $51K as short-term bull case strengthens","url":"https://cointelegraph.com/news/bitcoin-hits-51k-as-short-term-bull-case-strengthens-amid-weakening-dollar"},{"label":"Rolling Stone: Kings of Leon NFT Album Release","url":"https://www.rollingstone.com/pro/news/kings-of-leon-when-you-see-yourself-album-nft-crypto-1135192/"}]'::jsonb,
  '{"btc_price_usd": 51607}'::jsonb
);

-- Event 2: Bitcoin Mining Difficulty Drops for First Time in 3 Months (March 3, 2022)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'bitcoin-mining-difficulty-drop-2022-03-03',
  '2022-03-03',
  'Bitcoin Mining Difficulty Drops 2% - First Decline in 3 Months',
  'Bitcoin''s mining difficulty underwent a rare 2% decrease on March 3, 2022, marking the first negative adjustment in three months. This followed a 12% hash rate drop from the all-time high of 214.6 EH/s recorded on February 12. The adjustment provided temporary relief to miners operating in a challenging environment amid broader crypto market fear (Fear & Greed Index at 39). Bitcoin was trading above $43K with market cap around $2T and BTC dominance at 41%.',
  '{"Bitcoin","Market Structure"}',
  '{"MILESTONE","TECH"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/FM6KeTQVkAESQY9.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/BitcoinMagazine/status/1499352784656928769","account_handle":"BitcoinMagazine"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/CryptoRank_io/status/1499288362657599489","account_handle":"CryptoRank_io"}}]'::jsonb,
  '[{"label":"Bitcoin.com News: Mining Difficulty Adjustment","url":"https://news.bitcoin.com/bitcoin-mining-difficulty-drops-for-the-first-time-in-3-months/"}]'::jsonb,
  '{"btc_price_usd": 43000, "hash_rate_drop_pct": 12, "difficulty_drop_pct": 2}'::jsonb
);

-- Event 3: NodeMonkes Bitcoin Ordinals Hit #3 NFT Market Cap (March 3, 2024)
INSERT INTO events (id, date, title, summary, category, tags, mode, image, media, links, metrics)
VALUES (
  'nodemonkes-ordinals-top3-2024-03-03',
  '2024-03-03',
  'NodeMonkes Bitcoin Ordinals Surge to #3 NFT by Market Cap',
  'Bitcoin Ordinals dominated NFT market discussions on March 3, 2024, with NodeMonkes surging to become the #3 top NFT collection by market cap, generating 175 BTC (~$10.9M) in volume. The milestone reflected explosive momentum in Bitcoin''s NFT ecosystem post-ETH Denver. Influential voices like Dan Held declared increased bullishness on Bitcoin DeFi, while Alex Becker''s viral prediction (4K+ likes) of an Ordinals explosion amplified hype. Projects like Ordiswap promoted native Bitcoin DeFi tools, and Leonidas teased the largest-ever Ordinals airdrop. Other collections like Quantum Cats saw 30%+ floor price gains.',
  '{"Bitcoin","NFTs","CT Lore"}',
  '{"MILESTONE","CULTURAL"}',
  '{"timeline"}',
  'https://pbs.twimg.com/media/GHvPpdEaAAAmnBL.jpg',
  '[{"type":"twitter","twitter":{"tweet_url":"https://x.com/coingecko/status/1764232147014189477","account_handle":"coingecko"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/danheld/status/1764326558393655354","account_handle":"danheld"}},{"type":"twitter","twitter":{"tweet_url":"https://x.com/LeonidasNFT/status/1764238309125988585","account_handle":"LeonidasNFT"}}]'::jsonb,
  '[{"label":"CoinGecko: NodeMonkes #3 NFT Market Cap","url":"https://www.coingecko.com/en/nft"},{"label":"Magic Eden Bitcoin Ordinals","url":"https://magiceden.io/ordinals"}]'::jsonb,
  '{"btc_price_usd": 62000, "nodemonkes_volume_btc": 175}'::jsonb
);
