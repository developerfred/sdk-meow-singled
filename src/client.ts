import { http, createClient } from "viem";
import { mainnet } from "viem/chains";

const client = createClient({
  chain: mainnet,
  transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
});

export { client };
