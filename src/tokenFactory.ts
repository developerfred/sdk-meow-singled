import { Address, getContract, parseAbi } from "viem";

import { client } from "./client";
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
      client: client,
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
      const tokenAddress = await this.tokenFactoryContract.createToken(
        name,
        symbol,
        initialSupply,
        reserveWeight,
        slope,
        creator,
        reserveTokenAddress,
        exchangeAddress,
      );

      console.log(`Token criado com sucesso! Endereço: ${tokenAddress}`);
      return tokenAddress;
    } catch (error) {
      console.error("Erro ao criar o token:", error);
      throw error;
    }
  }
}
