import { Client, WalletClient, createClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";

class ClientManager {
  private client: WalletClient | null = null;
  private publicClient: Client | null = null;
  private account: string | null = null;
  private initializePromise: Promise<void>;

  constructor() {
    this.initializePromise = this.initialize(); // Armazena a promessa de inicialização
  }

  private async initialize(): Promise<void> {
    const isBrowser: boolean = typeof window !== "undefined" && typeof window.ethereum !== "undefined";
    const transport = isBrowser
      ? custom(window.ethereum)
      : http("https://endpoints.omniatech.io/v1/eth/sepolia/public");

    const createViemClient = async (useWalletClient: boolean): Promise<Client | WalletClient> => {
      const clientOptions = {
        batch: { multicall: true },
        chain: sepolia,
        transport,
      };

      return useWalletClient ? await createWalletClient(clientOptions) : await createClient(clientOptions);
    };

    this.publicClient = (await createViemClient(false)) as Client;
    this.client = (await createViemClient(true)) as WalletClient;

    if ("getAddresses" in this.client) {
      [this.account] = await (this.client as any).getAddresses();
    }
  }

  public getClient(): WalletClient | null {
    return this.client;
  }

  public getPublicClient(): Client | null {
    return this.publicClient;
  }

  public getAccount(): string | null {
    return this.account;
  }

  public async ensureInitialized(): Promise<void> {
    await this.initializePromise;
  }
}

export const clientManager = new ClientManager();
