import { Client, WalletClient, createClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";

class ClientManager {
  private client: WalletClient | null = null;
  private publicClient: Client | null = null;
  private account: string | null = null;
  private initializePromise: Promise<void>;

  constructor() {
    this.initializePromise = this.initialize();
  }

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  }

  private async createViemClient(useWalletClient: boolean): Promise<Client | WalletClient> {
    const transport = this.isBrowser()
      ? custom(window.ethereum!)
      : http("https://endpoints.omniatech.io/v1/eth/sepolia/public");

    const clientOptions = {
      batch: { multicall: true },
      chain: sepolia,
      transport,
    };

    return useWalletClient ? createWalletClient(clientOptions) : createClient(clientOptions);
  }

  private async initialize(): Promise<void> {
    this.publicClient = (await this.createViemClient(false)) as Client;
    this.client = (await this.createViemClient(true)) as WalletClient;

    if (this.client && "getAddresses" in this.client) {
      const addresses = await this.client.getAddresses();
      if (addresses.length > 0) {
        this.account = addresses[0];
      }
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
