import { client } from "./client";
import { EXCHANGE_ADDRESS } from "./constants";
import { Address, getContract, maxUint256, parseAbi } from "viem";

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
      client: client,
    });
  }

  async buyTokens(
    tokenAddress: Address,
    reserveAmount: typeof maxUint256
  ): Promise<string> {
    try {
      const buyToken = await this.exchangeContract.buyToken(
        tokenAddress,
        reserveAmount
      );
      console.log(`Token Amount Buy: ${reserveAmount}`);
      return buyToken;
    } catch (error) {
      console.error("Error buying token:", error);
      throw error;
    }
  }

  async sellTokens(
    tokenAddress: Address,
    reserveAmount: typeof maxUint256
  ): Promise<string> {
    try {
      const sellToken = await this.exchangeContract.sellToken(
        tokenAddress,
        reserveAmount
      );
      console.log(`Token Amount Sell: ${reserveAmount}`);
      return sellToken;
    } catch (error) {
      console.error("Error selling token:", error);
      throw error;
    }
  }

  static buy(tokenAddress: Address, reserveAmount: typeof maxUint256) {
    const exchange = new TokenExchange(tokenAddress);
    return exchange.buyTokens(tokenAddress, reserveAmount);
  }

  static sell(tokenAddress: Address, reserveAmount: typeof maxUint256) {
    const exchange = new TokenExchange(tokenAddress);
    return exchange.sellTokens(tokenAddress, reserveAmount);
  }
}
