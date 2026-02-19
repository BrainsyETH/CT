import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

/**
 * Zora client setup using viem
 * Requires environment variables:
 * - ZORA_WALLET_PRIVATE_KEY (hex-encoded private key with 0x prefix)
 * - ZORA_WALLET_ADDRESS (public address for payoutRecipient)
 */

export function validateZoraEnv(): void {
  const required = ["ZORA_WALLET_PRIVATE_KEY", "ZORA_WALLET_ADDRESS"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Zora environment variables: ${missing.join(", ")}`
    );
  }
}

export function getZoraConfig() {
  validateZoraEnv();

  return {
    walletAddress: process.env.ZORA_WALLET_ADDRESS! as `0x${string}`,
    privateKey: process.env.ZORA_WALLET_PRIVATE_KEY! as `0x${string}`,
  };
}

export function getZoraClients() {
  const { privateKey } = getZoraConfig();
  const account = privateKeyToAccount(privateKey);

  const rpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";

  const publicClient = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });

  return { publicClient, walletClient, account };
}
