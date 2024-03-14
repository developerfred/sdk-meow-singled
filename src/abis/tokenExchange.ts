export const tokenExchangeAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_tokenFactory",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "buyToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "reserveAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sellToken",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "tokenFactory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract TokenFactory",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "TokenBought",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amountSpent",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "tokensBought",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenSold",
    inputs: [
      {
        name: "seller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokensSold",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "amountReceived",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "PRBMath_MulDiv18_Overflow",
    inputs: [
      {
        name: "x",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "y",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "PRBMath_MulDiv_Overflow",
    inputs: [
      {
        name: "x",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "y",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "denominator",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "Reentrancy",
    inputs: [],
  },
] as const;
