import { Address, Client, WalletClient, createClient, createWalletClient, custom, http } from "viem";
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

  private async requestAccount(): Promise<string | null> {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      const accounts = await window.ethereum!.request({ method: "eth_requestAccounts" });
      return accounts.length > 0 ? accounts[0] : null;
    } catch (error) {
      console.error("Failed to request account:", error);
      return null;
    }
  }

  private async createViemClient(
    useWalletClient: boolean,
    account: string | null = null,
  ): Promise<Client | WalletClient | null> {
    try {
      const transport = this.isBrowser()
        ? custom(window.ethereum)
        : http("https://endpoints.omniatech.io/v1/eth/sepolia/public");

      const clientOptions = {
        batch: { multicall: true },
        chain: sepolia,
        transport,
      };

      if (useWalletClient && account) {
        Object.assign(clientOptions, { account });
      }

      return useWalletClient ? await createWalletClient(clientOptions) : await createClient(clientOptions);
    } catch (error) {
      console.error("Failed to create Viem client:", error);
      return null;
    }
  }

  private async initialize(): Promise<void> {
    try {
      const account = await this.requestAccount();
      this.account = account;

      const publicClient = await this.createViemClient(false);
      const client = await this.createViemClient(true, account);

      if (!publicClient || !client) {
        throw new Error("Failed to initialize Viem clients.");
      }

      this.publicClient = publicClient as Client;
      this.client = client as WalletClient;
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

  public async getWalletClient(account?: Address): Promise<WalletClient | null> {
    if (account && this.isBrowser()) {
      try {
        const client = await createWalletClient({
          account,
          chain: sepolia,
          transport: custom(window.ethereum),
        });
        return client;
      } catch (error) {
        console.error("Failed to create wallet client with specified account:", error);
        return null;
      }
    }
    return this.client;
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
