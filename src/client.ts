import { createClient, createWalletClient, custom, http } from "viem";
import { mainnet, sepolia } from "viem/chains";

const publicClient = createClient({
  batch: {
    multicall: true,
  },
  chain: sepolia,
  transport: http(`https://endpoints.omniatech.io/v1/eth/sepolia/public`),
});

const client = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum!),
});

export { client, publicClient };
