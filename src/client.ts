import { createClient, custom, http } from "viem";
import { mainnet } from "viem/chains";

const client = createClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
});

export { client };
