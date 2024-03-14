import { Address, getContract, parseAbi } from "viem";

import { tokenFactoryAbi } from "./abis/tokenFactory";
import { clientManager } from "./clientManager";
import { TOKEN_FACTORY } from "./constants";

interface ITokenFactoryContract {
  read: {
    getTokenConfig: (tokenAddress: Address) => Promise<TokenConfig>;
  };
  write: {
    createToken: (
      name: string,
      symbol: string,
      initialSupply: number,
      reserveWeight: number,
      slope: number,
      creator: Address,
      reserveTokenAddress: Address,
      exchangeAddress: Address,
    ) => Promise<string>;
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
  private tokenFactoryContractPromise: Promise<ITokenFactoryContract>;

  constructor(tokenFactoryAddress: Address = TOKEN_FACTORY) {
    this.tokenFactoryContractPromise = this.initializeContract(tokenFactoryAddress);
  }

  private async initializeContract(tokenFactoryAddress: Address): Promise<ITokenFactoryContract> {
    await clientManager.ensureInitialized();
    const contract = getContract({
      address: tokenFactoryAddress,
      abi: tokenFactoryAbi,
      client: {
        public: clientManager.getPublicClient()!,
        wallet: clientManager.getClient()!,
      },
    });
    return contract as unknown as ITokenFactoryContract;
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
    const contract = await this.tokenFactoryContractPromise;
    return contract.write.createToken(
      name,
      symbol,
      initialSupply,
      reserveWeight,
      slope,
      creator,
      reserveTokenAddress,
      exchangeAddress,
    );
  }

  async getTokenConfig(tokenAddress: Address): Promise<TokenConfig> {
    const contract = await this.tokenFactoryContractPromise;
    return contract.read.getTokenConfig(tokenAddress);
  }
}
