# Meow Single Pool SDK

The **Meow Single Pool SDK** streamlines interactions with blockchain networks, simplifying the processes of token
creation and exchange. Designed with a focus on the Sepolia network, this SDK offers a robust and flexible way to
integrate smart contract functionalities into your projects, catering to both the Ethereum mainnet and testnets.

## Features

- Streamlined token creation and interaction with exchange contracts.
- Support for Ethereum's Sepolia testnet and mainnet, with the capability to extend to other networks.
- Easy integration for both browser and Node.js environments.

## Installation

To get started with the Meow Single Pool SDK, install it via npm:

```bash
npm install @codingsheth/meow-sdk
```

Or, if you prefer Bun:

```bash
bun add @codingsheth/meow-sdk
```

## Quick Start

### Client Configuration

First, set up the client to connect to your desired blockchain network:

```typescript
import { client, publicClient } from "@codingsheth/meow-sdk";

// Client setup is automatically handled by the imports
```

### Creating Tokens

To create a new token:

```typescript
import { TokenFactory } from "@codingsheth/meow-sdk";

(async () => {
  const tokenFactory = new TokenFactory();

  const transactionHash = await tokenFactory.createToken(
    "TokenName",
    "SYMB",
    1000000, // Initial supply
    10, // Reserve weight
    1, // Slope
    "0xCreatorAddress",
    "0xReserveTokenAddress",
    "0xExchangeAddress",
  );

  console.log(`Transaction hash: ${transactionHash}`);
})();
```

### Token Exchange

For buying or selling tokens:

```typescript
import { TokenExchange } from "@codingsheth/meow-sdk";
import { maxUint256 } from "viem";

(async () => {
  const tokenExchange = new TokenExchange();

  // To buy tokens
  const buyTransactionHash = await tokenExchange.buyTokens("0xTokenAddress", maxUint256);
  console.log(`Buy transaction hash: ${buyTransactionHash}`);

  // To sell tokens
  const sellTransactionHash = await tokenExchange.sellTokens("0xTokenAddress", 1000);
  console.log(`Sell transaction hash: ${sellTransactionHash}`);
})();
```

## Documentation

For detailed API documentation and additional functionalities, visit
[the project's GitHub page](https://github.com/developerfred/sdk-meow-singled).

## Support

Encountered a bug or have a suggestion? Open an [issue](https://github.com/developerfred/sdk-meow-singled/issues) on
GitHub.

## License

Distributed under the MIT License. See `LICENSE` for more information.
