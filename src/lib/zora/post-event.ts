import { createCoin, CreateConstants } from "@zoralabs/coins-sdk";
import { base } from "viem/chains";
import { getZoraClients, getZoraConfig } from "./client";
import { formatZoraPost } from "./format-post";
import type { Event } from "@/lib/types";

export interface PostZoraResult {
  success: boolean;
  coinAddress?: string;
  txHash?: string;
  coinSymbol?: string;
  coinUrl?: string;
  error?: string;
}

/**
 * Posts an event to Zora by creating a Content Coin on Base.
 */
export async function postEventToZora(
  event: Event,
  postDate: string,
  slotIndex: number
): Promise<PostZoraResult> {
  try {
    const { walletAddress } = getZoraConfig();
    const { publicClient, walletClient } = getZoraClients();

    const payload = formatZoraPost(event, postDate, slotIndex);

    const result = await createCoin({
      call: {
        name: payload.name,
        symbol: payload.symbol,
        metadata: {
          type: "RAW_URI",
          uri: payload.metadataUri,
        },
        creator: walletAddress,
        currency: CreateConstants.ContentCoinCurrencies.ETH,
        chainId: base.id,
        startingMarketCap: CreateConstants.StartingMarketCaps.LOW,
        payoutRecipientOverride: walletAddress,
      },
      walletClient,
      publicClient,
    });

    const coinAddress = result.address;
    const txHash = result.hash;
    const coinUrl = `https://zora.co/coin/base:${coinAddress}`;

    return {
      success: true,
      coinAddress,
      txHash,
      coinSymbol: payload.symbol,
      coinUrl,
    };
  } catch (error) {
    console.error("Failed to post to Zora:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
