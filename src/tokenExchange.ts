import { Address, getContract, maxUint256 } from "viem";

import { erc20Abi } from "./abis/erc20ABI";
import { tokenExchangeAbi } from "./abis/tokenExchange";
import { clientManager } from "./clientManager";
import { EXCHANGE_ADDRESS } from "./constants";

type ContractFunction<T extends any[] = any[], R = any> = (...args: T) => Promise<R>;

interface IContractClient {
  public: ReturnType<typeof clientManager.getPublicClient>;
  wallet: ReturnType<typeof clientManager.getClient>;
}

interface IExchangeContract {
  write: {
    buyToken: ContractFunction<[Address, typeof maxUint256], string>;
    sellToken: ContractFunction<[Address, typeof maxUint256], string>;
  };
  address: Address;
  abi: typeof tokenExchangeAbi;
  client: IContractClient;
}

interface IERC20Contract {
  write: {
    approve: (spender: Address, amount: bigint) => Promise<string>;
  };
}

class TokenExchange {
  private exchangeContract!: IExchangeContract;
  private isInitialized: boolean = false;

  constructor(tokenExchangeAddress: Address = EXCHANGE_ADDRESS) {
    this.initializeContract(tokenExchangeAddress, tokenExchangeAbi)
      .then((contract) => {
        this.exchangeContract = contract as IExchangeContract;
        this.isInitialized = true;
        console.log(`TokenExchange contract initialized at address: ${tokenExchangeAddress}`);
      })
      .catch((error) => {
        console.error("Failed to initialize the exchange contract:", error);
        this.isInitialized = false;
      });
  }

  private async initializeContract<T>(address: Address, abi: any): Promise<T> {
    console.log(`Initializing contract at address: ${address}`);
    const contract = await getContract({
      address,
      abi,
      client: {
        public: clientManager.getPublicClient()!,
        wallet: clientManager.getClient()!,
      },
    });
    return contract as T;
  }

  private async ensureContractInitialized(): Promise<void> {
    while (!this.isInitialized) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private async executeTokenOperation(
    operation: keyof IExchangeContract["write"],
    tokenAddress: Address,
    amount: bigint,
  ): Promise<string> {
    await this.ensureContractInitialized();
    console.log(`Attempting to ${operation} with token at address: ${tokenAddress} for amount: ${amount}`);
    try {
      const hash = await this.exchangeContract.write[operation](tokenAddress, amount);
      console.log(
        `Success! Operation: ${operation}, Token Address: ${tokenAddress}, Amount: ${amount}, Transaction Hash: ${hash}`,
      );
      return hash;
    } catch (error) {
      console.error(
        `Error executing ${operation} for token at address ${tokenAddress} with amount ${amount}. Error: ${error}`,
      );
      throw error;
    }
  }

  public async buyTokens(tokenAddress: Address, amount: bigint): Promise<string> {
    return this.executeTokenOperation("buyToken", tokenAddress, amount);
  }

  public async sellTokens(tokenAddress: Address, amount: bigint): Promise<string> {
    return this.executeTokenOperation("sellToken", tokenAddress, amount);
  }

  public async approveTokens(tokenAddress: Address, amount: bigint): Promise<string> {
    await this.ensureContractInitialized();
    console.log(`Approving tokens... Token Address: ${tokenAddress}, Amount: ${amount}`);
    const erc20Contract = this.initializeContract<IERC20Contract>(tokenAddress, erc20Abi) as Promise<IERC20Contract>;
    const approvalHash = await (await erc20Contract).write.approve(EXCHANGE_ADDRESS, amount);
    console.log(
      `Tokens approved. Token Address: ${tokenAddress}, Amount: ${amount}, Approval Transaction Hash: ${approvalHash}`,
    );
    return approvalHash;
  }
}

export { TokenExchange };
