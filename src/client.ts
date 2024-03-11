import { createClient, createWalletClient, custom, http } from "viem";
import { mainnet, sepolia } from "viem/chains";

const isBrowser = typeof window.ethereum! !== "undefined";

const publicClient = createClient({
  batch: {
    multicall: true,
  },
  chain: sepolia,
  transport: http(`https://endpoints.omniatech.io/v1/eth/sepolia/public`),
});

const client = createWalletClient({
  chain: sepolia,
  transport: isBrowser ? custom(window.ethereum!) : http(`https://endpoints.omniatech.io/v1/eth/sepolia/public`),
});

export { client, publicClient };
