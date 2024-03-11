import { Address, getContract, maxUint256, parseAbi } from "viem";

import { client, publicClient } from "./client";
import { EXCHANGE_ADDRESS } from "./constants";

const abiExchange = parseAbi([
  "function buyToken(address token, uint256 reserveAmount)",
  "function sellToken(address token, uint256 tokenAmount)",
]);

export class TokenExchange {
  private exchangeContract: any;

  constructor(tokenExchangeAddress: Address = EXCHANGE_ADDRESS) {
    this.exchangeContract = getContract({
      address: tokenExchangeAddress,
      abi: abiExchange,
      client: { public: publicClient, wallet: client },
    });
  }

  async buyTokens(tokenAddress: Address, reserveAmount: typeof maxUint256): Promise<string> {
    try {
      const hash = await this.exchangeContract.write.buyToken(tokenAddress, reserveAmount);
      console.log(`Token Amount Buy: ${reserveAmount} and hash: ${hash}`);
      return hash;
    } catch (error) {
      console.error("Error buying token:", error);
      throw error;
    }
  }

  async sellTokens(tokenAddress: Address, tokenAmount: typeof maxUint256): Promise<string> {
    try {
      const hash = await this.exchangeContract.write.sellToken(tokenAddress, reserveAmount);
      const logs = await this.exchangeContract.getEvents.sellToken();
      const unwatch = this.exchangeContract.watchEvent.sellToken(
        {
          to: EXCHANGE_ADDRESS,
        },
        { onLogs: (logs: any) => console.log(logs) },
      );

      console.log(`Token Amount Sell: ${tokenAmount} and hash: ${hash}`);
      return hash;
    } catch (error) {
      console.error("Error selling token:", error);
      throw error;
    }
  }

  static buy(tokenAddress: Address, reserveAmount: typeof maxUint256) {
    const exchange = new TokenExchange(EXCHANGE_ADDRESS);
    return exchange.buyTokens(tokenAddress, reserveAmount);
  }

  static sell(tokenAddress: Address, tokenAmount: typeof maxUint256) {
    const exchange = new TokenExchange(EXCHANGE_ADDRESS);
    return exchange.sellTokens(tokenAddress, tokenAmount);
  }
}
