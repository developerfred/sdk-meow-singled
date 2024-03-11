import { Address, getContract, parseAbi } from "viem";

import { client, publicClient } from "./client";
import { TOKEN_FACTORY } from "./constants";

const abiFactory = parseAbi([
  "function createToken(string name, string symbol, uint256 initialSupply, uint256 reserveWeight, uint256 slope, address creator, address reserveTokenAddress, address _exchangeAddress)",
]);

export class TokenFactory {
  private tokenFactoryContract: any;

  constructor(tokenFactoryAddress: Address = TOKEN_FACTORY) {
    this.tokenFactoryContract = getContract({
      address: tokenFactoryAddress,
      abi: abiFactory,
      client: { public: publicClient, wallet: client },
    });
  }

  async createToken(
    name: string,
    symbol: string,
    initialSupply: number,
    reserveWeight: number,
    slope: number,
    creator: string,
    reserveTokenAddress: string,
    exchangeAddress: string,
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
      const logs = await this.tokenFactoryContract.getEvents.createToken();
      const unwatch = this.tokenFactoryContract.watchEvent.createToken(
        {
          from: creator,
          to: TOKEN_FACTORY,
        },
        { onLogs: (logs: any) => console.log(logs) },
      );

      console.log(`hash transaction: ${hash} && logs ${logs} && ${unwatch}`);
      return hash;
    } catch (error) {
      console.error("Erro ao criar o token:", error);
      throw error;
    }
  }

  static createToken(
    name: string,
    symbol: string,
    initialSupply: number,
    reserveWeight: number,
    slope: number,
    creator: string,
    reserveTokenAddress: string,
    exchangeAddress: string,
  ) {
    const Factory = new TokenFactory(TOKEN_FACTORY);
    return Factory.createToken(
      name,
      symbol,
      initialSupply,
      reserveWeight,
      slope,
      creator,
      exchangeAddress,
      reserveTokenAddress,
    );
  }
}
