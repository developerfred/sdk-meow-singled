import { Address, getContract, maxUint256, parseAbi } from "viem";

import { tokenExchangeAbi } from "./abis/tokenExchange";
import { clientManager } from "./clientManager";
import { EXCHANGE_ADDRESS } from "./constants";

type ContractFunction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>;
type ContractEvent<T extends any[] = any[], R = any> = (...args: T) => Promise<R>;

interface IExchangeContract {
  read: {
    [functionName: string]: ContractFunction;
  };
  simulate: {
    [functionName: string]: ContractFunction;
  };
  createEventFilter: {
    [eventName: string]: ContractEvent;
  };
  getEvents: {
    [eventName: string]: ContractEvent;
  };
  watchEvent: {
    [eventName: string]: ContractEvent;
  };
  write: {
    buyToken: ContractFunction<[Address, typeof maxUint256], string>;
    sellToken: ContractFunction<[Address, typeof maxUint256], string>;
  };
  address: Address;
  abi: typeof tokenExchangeAbi;
  client: {
    public: ReturnType<typeof clientManager.getPublicClient>;
    wallet: ReturnType<typeof clientManager.getClient>;
  };
}

class TokenExchange {
  private exchangeContract: IExchangeContract;

  constructor(tokenExchangeAddress: Address = EXCHANGE_ADDRESS) {
    this.exchangeContract = this.initializeContract(tokenExchangeAddress);
  }

  private initializeContract(tokenExchangeAddress: Address): IExchangeContract {
    const contract = getContract({
      address: tokenExchangeAddress,
      abi: tokenExchangeAbi,
      client: {
        public: clientManager.getPublicClient()!,
        wallet: clientManager.getClient()!,
      },
    });

    return contract as unknown as IExchangeContract;
  }

  private async executeTokenOperation(
    operation: keyof IExchangeContract["write"],
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
