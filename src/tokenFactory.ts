import { Address, getContract } from "viem";

import { tokenFactoryAbi } from "./abis/tokenFactory";
import { clientManager } from "./clientManager";
import { TOKEN_FACTORY } from "./constants";

interface ITokenFactoryContract {
  read: {
    getTokenConfig(tokenAddress: Address): Promise<TokenConfig>;
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

  async createToken(
    name: string,
    symbol: string,
    initialSupply: number,
    reserveWeight: number,
    slope: number,
    creator: Address,
    reserveTokenAddress: Address,
    exchangeAddress: Address,
  ): Promise<string> {
    if (!this.isContractReady || !this.contract) {
      throw new Error("Contract not ready");
    }

    return this.contract.write.createToken(
      name,
      symbol,
      this.toBigInt(initialSupply),
      this.toBigInt(reserveWeight),
      this.toBigInt(slope),
      creator,
      reserveTokenAddress,
      exchangeAddress,
    );
  }

  async getTokenConfig(tokenAddress: Address): Promise<TokenConfig> {
    if (!this.isContractReady || !this.contract) {
      throw new Error("Contract not ready");
    }
    return this.contract.read.getTokenConfig(tokenAddress);
  }
}
