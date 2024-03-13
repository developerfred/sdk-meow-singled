import { Address, getContract, parseAbi } from "viem";

import { client, publicClient } from "./client";
import { TOKEN_FACTORY } from "./constants";

interface ITokenFactoryContract {
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

const abiFactory = parseAbi([
  "function createToken(string name, string symbol, uint256 initialSupply, uint256 reserveWeight, uint256 slope, address creator, address reserveTokenAddress, address _exchangeAddress)",
]);

export class TokenFactory {
  private tokenFactoryContract: ITokenFactoryContract;

  constructor(tokenFactoryAddress: Address = TOKEN_FACTORY) {
    this.tokenFactoryContract = getContract({
      address: tokenFactoryAddress,
      abi: abiFactory,
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
}
