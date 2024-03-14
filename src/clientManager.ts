import { Client, WalletClient, createClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";

class ClientManager {
  private client: WalletClient | null = null;
  private publicClient: Client | null = null;
  private account: string | null = null;
  private initializePromise: Promise<void> | null = null;

  constructor() {
    this.safeInitialize();
  }

  private isBrowser(): boolean {
    try {
      return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
    } catch (error) {
      console.error("Environment check failed:", error);
      return false;
    }
  }

  private async createViemClient(useWalletClient: boolean): Promise<Client | WalletClient | null> {
    try {
      const transport = this.isBrowser()
        ? custom(window.ethereum)
        : http("https://endpoints.omniatech.io/v1/eth/sepolia/public");

      const clientOptions = {
        batch: { multicall: true },
        chain: sepolia,
        transport,
      };

      return useWalletClient ? await createWalletClient(clientOptions) : await createClient(clientOptions);
    } catch (error) {
      console.error("Failed to create Viem client:", error);
      return null;
    }
  }

  private async initialize(): Promise<void> {
    try {
      const publicClient = await this.createViemClient(false);
      const client = await this.createViemClient(true);

      if (!publicClient || !client) {
        throw new Error("Failed to initialize Viem clients.");
      }

      this.publicClient = publicClient as Client;
      this.client = client as WalletClient;

      if ("getAddresses" in this.client) {
        const addresses = await this.client.getAddresses();
        if (addresses.length > 0) {
          this.account = addresses[0];
        }
      }
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  }

  private safeInitialize() {
    this.initializePromise = this.initialize().catch((error) => {
      console.error("Safe initialization failed:", error);
      this.initializePromise = null; // Allow retrying initialization
    });
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
    if (!this.initializePromise) {
      console.warn("ClientManager was not initialized. Retrying...");
      this.safeInitialize();
    }
    await this.initializePromise;
  }
}

export const clientManager = new ClientManager();
