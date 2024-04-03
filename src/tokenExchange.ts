import { Address, getAddress, getContract, isAddress, maxUint256 } from "viem";
import { parseAbi } from "viem";



import { tokenExchangeAbi } from "./abis/tokenExchange";
import { clientManager } from "./clientManager";
import { EXCHANGE_ADDRESS } from "./constants";


const abiERC20 = parseAbi([
  "function approve(address spender, uint256 amount) external returns (bool)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "function balanceOf(address owner) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)",
]);

export const MEOWAbi = [
  {
    type: "function",
    name: "depositReserveToken",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export const erc20Abi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_from",
        type: "address",
      },
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
] as const;

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
  read: {
    calculateExchangeAmount: ContractFunction<[Address, bigint, boolean], bigint>;
    tokenFactory: ContractFunction<[], Address>;
  };
  address: Address;
  abi: typeof tokenExchangeAbi;
  client: IContractClient;
}

interface IERC20Contract {
  write: {
    approve: (spender: Address, amount: bigint) => Promise<string>;
  };
  read: {
    allowance: (owner: Address, spender: Address) => Promise<bigint>;
    symbol: () => Promise<string>;
    name: () => Promise<string>;
  };
}

interface IMEOWChild {
  write: {
    depositReserveToken: (spender: Address, amount: bigint) => Promise<string>;
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

  public async checkAllowance(exchangeAddress: Address, tokenAddress: Address, owner: Address): Promise<bigint> {
    try {
      await this.ensureContractInitialized();

      const erc20Contract = await this.initializeContract<IERC20Contract>(tokenAddress, erc20Abi);

      const normalizedOwnerAddress = isAddress(owner) ? owner : getAddress(owner);
      const normalizedSpenderAddress = isAddress(exchangeAddress) ? exchangeAddress : getAddress(exchangeAddress);
      //@ts-ignore
      const allowance = await erc20Contract.read.allowance([normalizedSpenderAddress, normalizedOwnerAddress]);

      console.log(
        `Checked allowance for token at address ${tokenAddress} to be spent by address ${normalizedSpenderAddress}: ${allowance.toString()}`,
      );

      return BigInt(allowance.toString());
    } catch (error) {
      console.error(
        `Error checking allowance for token at address ${tokenAddress} to be spent by address ${exchangeAddress}:`,
        error,
      );
      throw error;
    }
  }

  public async checkAndApproveAllowanceIfNeeded(
    tokenAddress: Address,
    spenderAddress: Address,
    amount: bigint,
  ): Promise<void> {
    await this.ensureContractInitialized();
    console.log(`Checking allowance for token at address: ${tokenAddress}`);

    const erc20Contract = await this.initializeContract<IERC20Contract>(tokenAddress, erc20Abi);
    //@ts-ignore
    const currentAllowance = await erc20Contract.read.allowance(getAddress(tokenAddress), getAddress(spenderAddress));

    if (currentAllowance < amount) {
      console.log(`Allowance is not sufficient. Approving tokens...`);
      await this.approveTokens(tokenAddress, amount);
    } else {
      console.log(`Allowance is sufficient for the transaction.`);
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
    const erc20Contract = await this.initializeContract<IERC20Contract>(tokenAddress, erc20Abi);
    //@ts-ignore
    const approvalHash = await erc20Contract.write.approve([EXCHANGE_ADDRESS, amount]);
    console.log(
      `Tokens approved. Token Address: ${tokenAddress}, Amount: ${amount}, Approval Transaction Hash: ${approvalHash}`,
    );
    return approvalHash;
  }

  public async calculateExchangeAmount(tokenAddress: Address, amount: bigint, isBuying: boolean): Promise<bigint> {
    await this.ensureContractInitialized();
    console.log(
      `Calculating exchange amount for token at address: ${tokenAddress} with amount: ${amount} and isBuying: ${isBuying}`,
    );
    try {
      const calculatedAmount = await this.exchangeContract.read.calculateExchangeAmount(tokenAddress, amount, isBuying);
      console.log(`Calculated exchange amount: ${calculatedAmount}`);
      return calculatedAmount;
    } catch (error) {
      console.error(`Error calculating exchange amount. Error: ${error}`);
      throw error;
    }
  }

  public async tokenFactory(): Promise<Address> {
    await this.ensureContractInitialized();
    console.log(`Retrieving token factory address`);
    try {
      const tokenFactoryAddress = await this.exchangeContract.read.tokenFactory();
      console.log(`Token factory address: ${tokenFactoryAddress}`);
      return tokenFactoryAddress;
    } catch (error) {
      console.error(`Error retrieving token factory address. Error: ${error}`);
      throw error;
    }
  }

  public async getTokenSymbol(tokenAddress: Address): Promise<string> {
    await this.ensureContractInitialized();
    console.log(`Retrieving symbol for token at address: ${tokenAddress}`);

    try {
      const erc20Contract = await this.initializeContract<IERC20Contract>(tokenAddress, erc20Abi);

      const symbol = await erc20Contract.read.symbol();
      console.log(`Token symbol: ${symbol}`);
      return symbol;
    } catch (error) {
      console.error(`Error retrieving token symbol for address ${tokenAddress}. Error: ${error}`);
      throw error;
    }
  }
  //@ts-ignore
  public async getTokenBalance(tokenAddress: Address, accountAddress: Address): Promise<bigint> {
    await this.ensureContractInitialized();
    console.log(`Retrieving balance for token at address: ${tokenAddress} for account: ${accountAddress}`);

    try {
      const erc20Contract = await this.initializeContract<IERC20Contract>(tokenAddress, erc20Abi);
      //@ts-ignore
      const balance = await erc20Contract.read.balanceOf(accountAddress);
      console.log(`Token balance for account ${accountAddress} is: ${balance.toString()}`);
      return balance;
    } catch (error) {
      console.error(
        `Error retrieving token balance for address ${accountAddress} on token ${tokenAddress}. Error: ${error}`,
      );
      throw error;
    }
  }

  public async depositReserveToken(amount: bigint, tokenAddress: Address): Promise<string> {
    await this.ensureContractInitialized();
    console.log(`Depositing reserve tokens... Amount: ${amount}`);

    const reserveTokenContract = await this.initializeContract<IMEOWChild>(tokenAddress, MEOWAbi);

    //@ts-ignore
    const depositHash = await reserveTokenContract.write.depositReserveToke([amount]);
    console.log(`Reserve tokens deposited. Amount: ${amount}, Deposit Transaction Hash: ${depositHash}`);
    return depositHash;
  }
}



export { TokenExchange };
