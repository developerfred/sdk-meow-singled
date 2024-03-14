import { Address, getContract, parseAbi } from "viem";

import { tokenFactoryAbi } from "./abis/tokenFactory";
import { client, publicClient } from "./client";
import { TOKEN_FACTORY } from "./constants";

interface ITokenFactoryContract {
  read: {
    getTokenConfig: (...args: any[]) => Promise<string>;
  };
  write: {
    createToken: (...args: any[]) => Promise<string>;
  };
  getEvents: {
    createToken: () => Promise<any>;
  };
  watchEvent: {
    createToken: (filter: object, options: { onLogs: (logs: any) => void }) => Promise<void>;
  };
}

interface TokenConfig {
  tokenAddress: string;
  reserveToken: string;
  slope: string;
  reserveWeight: string;
}

export class TokenFactory {
  private tokenFactoryContract: ITokenFactoryContract;

  constructor(tokenFactoryAddress: Address = TOKEN_FACTORY) {
    this.tokenFactoryContract = getContract({
      address: tokenFactoryAddress,
      abi: tokenFactoryAbi,
      client: { public: publicClient, wallet: client },
    }) as unknown as ITokenFactoryContract;
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
    try {
      const hash = await this.tokenFactoryContract.write.createToken(
        name,
        symbol,
        initialSupply,
        reserveWeight,
        slope,
        creator,
        reserveTokenAddress,
        exchangeAddress,
      );

      console.log(`Transaction hash: ${hash}`);
      return hash;
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    }
  }

  async getTokenConfig(tokenAddress: Address): Promise<{ config: TokenConfig }> {
    try {
      const result: any = await this.tokenFactoryContract.read.getTokenConfig(tokenAddress);

      const [configTuple]: [[string, string, bigint, bigint]] = result;

      const config: TokenConfig = {
        tokenAddress: configTuple[0],
        reserveToken: configTuple[1],
        slope: configTuple[2].toString(),
        reserveWeight: configTuple[3].toString(),
      };

      return { config };
    } catch (error) {
      console.error("Error getting token config:", error);
      throw error;
    }
  }
}
