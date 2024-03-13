import { createClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";

const isBrowser = typeof window !== "undefined" && typeof window.ethereum !== "undefined";

const createTransport = (isBrowser: boolean) => {
  return isBrowser ? custom(window.ethereum) : http("https://endpoints.omniatech.io/v1/eth/sepolia/public");
};

const createViemClient = ({ useWalletClient = false }) => {
  const transport = createTransport(isBrowser);
  const clientOptions = {
    batch: {
      multicall: true,
    },
    chain: sepolia,
    transport,
  };

  return useWalletClient ? createWalletClient(clientOptions) : createClient(clientOptions);
};

const publicClient = createViemClient({ useWalletClient: false });
const client = createViemClient({ useWalletClient: true });

export { client, publicClient };
