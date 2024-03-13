import { Address, getContract, maxUint256, parseAbi } from "viem";

import { client, publicClient } from "./client";
import { EXCHANGE_ADDRESS } from "./constants";

interface IExchangeContract {
  read: {
    [functionName: string]: (...args: any[]) => Promise<any>;
  };
  simulate: {
    [functionName: string]: (...args: any[]) => Promise<any>;
  };
  createEventFilter: {
    [eventName: string]: (...args: any[]) => Promise<any>;
  };
  getEvents: {
    [eventName: string]: (...args: any[]) => Promise<any>;
  };
  watchEvent: {
    [eventName: string]: (...args: any[]) => Promise<any>;
  };
  write: {
    [functionName: string]: (...args: any[]) => Promise<any>;
  };
  address: Address;
  abi: any;
  client: {
    public: typeof publicClient;
    wallet: typeof client;
  };
}

const abiExchange = parseAbi([
  "function buyToken(address token, uint256 reserveAmount)",
  "function sellToken(address token, uint256 tokenAmount)",
]);

class TokenExchange {
  private exchangeContract: IExchangeContract;

  constructor(tokenExchangeAddress: Address = EXCHANGE_ADDRESS) {
    this.exchangeContract = this.initializeContract(tokenExchangeAddress);
  }

  private initializeContract(tokenExchangeAddress: Address): IExchangeContract {
    const contract = getContract({
      address: tokenExchangeAddress,
      abi: abiExchange,
      client: { public: publicClient, wallet: client },
    });

    return contract as unknown as IExchangeContract;
  }

  private async executeTokenOperation(
    operation: "buyToken" | "sellToken",
    tokenAddress: Address,
    amount: typeof maxUint256,
  ): Promise<string> {
    try {
      const hash = await this.exchangeContract.write[operation](tokenAddress, amount);
      console.log(
        `Operation: ${operation}, Token Address: ${tokenAddress}, Amount: ${amount}, Transaction Hash: ${hash}`,
      );
      return hash;
    } catch (error) {
      console.error(`Failed to execute ${operation} for token at address ${tokenAddress} with amount ${amount}`, error);
      throw error;
    }
  }

  async buyTokens(tokenAddress: Address, reserveAmount: typeof maxUint256): Promise<string> {
    return this.executeTokenOperation("buyToken", tokenAddress, reserveAmount);
  }

  async sellTokens(tokenAddress: Address, tokenAmount: typeof maxUint256): Promise<string> {
    return this.executeTokenOperation("sellToken", tokenAddress, tokenAmount);
  }
}

export { TokenExchange };
