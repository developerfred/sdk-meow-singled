import { Address, getContract } from "viem";

import { tokenFactoryAbi } from "./abis/tokenFactory";
import { clientManager } from "./clientManager";
import { TOKEN_FACTORY } from "./constants";

interface ITokenFactoryContract {
  read: {
    defaultReserveToken(): Promise<Address>;
    getTokenConfig(tokenAddress: Address): Promise<TokenConfig>;
    getTokensBatch(from: bigint, to: bigint): Promise<Address[]>;
    initialize(defaultReserveToken: Address): Promise<void>;
    isTokenFromFactory(tokenAddress: Address): Promise<boolean>;
    listAllTokens(): Promise<Address[]>;
    owner(): Promise<Address>;
    tokenConfigs(tokenAddress: Address): Promise<TokenConfig>;
    tokensCreatedBy(creator: Address): Promise<Address[]>;
    totalCreatedTokens(): Promise<bigint>;
  };
  write: {
    createToken(
      name: string,
      symbol: string,
      initialSupply: bigint,
      reserveWeight: bigint,
      slope: bigint,
      creator: Address,
      reserveTokenAddress: Address,
      exchangeAddress: Address,
    ): Promise<string>;
    renounceOwnership(): Promise<void>;
    transferOwnership(newOwner: Address): Promise<void>;
  };
}

interface TokenConfig {
  tokenAddress: string;
  reserveToken: string;
  slope: number;
  reserveWeight: number;
}

export class TokenFactory {
  private contract?: ITokenFactoryContract;
  public isContractReady: boolean = false;

  constructor(private tokenFactoryAddress: Address = TOKEN_FACTORY) {}

  public async initialize(): Promise<void> {
    try {
      await clientManager.ensureInitialized();

      // @ts-ignore
      this.contract = await getContract<ITokenFactoryContract>({
        abi: tokenFactoryAbi,
        address: this.tokenFactoryAddress,
        client: await clientManager.getClient(),
      });
      this.isContractReady = true;
      console.log("TokenFactory contract initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize TokenFactory contract:", error);
      throw new Error("Contract initialization failed");
    }
  }

  private toBigInt(number: number): bigint {
    return BigInt(number);
  }

  private ensureContractReady(): void {
    if (!this.isContractReady || !this.contract) {
      throw new Error("Contract not ready");
    }
  }

  async defaultReserveToken(): Promise<Address> {
    this.ensureContractReady();
    return this.contract!.read.defaultReserveToken();
  }

  async listAllTokens(): Promise<Address[]> {
    this.ensureContractReady();
    return this.contract!.read.listAllTokens();
  }

  async isTokenFromFactory(tokenAddress: Address): Promise<boolean> {
    this.ensureContractReady();
    return this.contract!.read.isTokenFromFactory(tokenAddress);
  }

  async createToken(
    nameToken: string,
    symbolToken: string,
    initialSupplyToken: bigint,
    reserveWeightToken: bigint,
    slopeToken: bigint,
    creatorToken: Address,
    reserveTokenAddressToken: Address,
    exchangeAddressToken: Address,
  ): Promise<string> {
    if (!this.isContractReady || !this.contract) {
      throw new Error("Contract not ready");
    }
    try {
      const walletClient = await clientManager.getWalletClient();
      if (!walletClient) {
        throw new Error("Failed to get wallet client.");
      }
      // @ts-ignore
      const tokenFactoryContract = await getContract<ITokenFactoryContract>({
        abi: tokenFactoryAbi,
        address: this.tokenFactoryAddress,
        client: {
          wallet: walletClient,
        },
      });
      // @ts-ignore
      if (!tokenFactoryContract || typeof tokenFactoryContract.write.createToken !== "function") {
        throw new Error("Contract not properly initialized or createToken function is not available.");
      }

      console.log("Contract is ready for interaction.");

      // @ts-ignore
      return await tokenFactoryContract.write.createToken(
        nameToken,
        symbolToken,
        initialSupplyToken,
        reserveWeightToken,
        slopeToken,
        creatorToken,
        reserveTokenAddressToken,
        exchangeAddressToken,
      );
    } catch (error) {
      console.error("Error calling createToken on the contract:", error);
      throw error;
    }
  }

  async getTokenConfig(tokenAddress: Address): Promise<TokenConfig> {
    if (!this.isContractReady || !this.contract) {
      throw new Error("Contract not ready");
    }
    return this.contract.read.getTokenConfig(tokenAddress);
  }
}
