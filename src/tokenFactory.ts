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

  private ensureContractReady(): void {
    if (!this.isContractReady || !this.contract) {
      throw new Error("Contract not ready");
    }
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
    account?: Address,
  ): Promise<string> {
    if (!this.isContractReady || !this.contract) {
      throw new Error("Contract not ready");
    }
    try {
      const walletClient = await clientManager.getWalletClient(account);
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

      if (!tokenFactoryContract || typeof tokenFactoryContract.write.createToken !== "function") {
        throw new Error("Contract not properly initialized or createToken function is not available.");
      }

      console.log("Contract is ready for interaction.");

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
