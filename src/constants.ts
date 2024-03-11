import { getAddress } from "viem";

const networkAddresses = {
  mainnet: {
    TOKEN_FACTORY: getAddress("0x927294e922c3f8FbdC34Bd8b1875aE3D3e1637dF"),
    EXCHANGE_ADDRESS: getAddress("0x6dba9e1d90afa4a97e2a819bcc1ad22deaf81794"),
    MEOW_ADDRESS: getAddress("0x54ceabc39627d9ceb578bb5fc4ce3db972b2ce69"),
    ADDRESS_ZERO: getAddress("0x0000000000000000000000000000000000000000"),
  },
  sepolia: {
    TOKEN_FACTORY: getAddress("0x927294e922c3f8FbdC34Bd8b1875aE3D3e1637dF"),
    EXCHANGE_ADDRESS: getAddress("0x6dba9e1d90afa4a97e2a819bcc1ad22deaf81794"),
    MEOW_ADDRESS: getAddress("0x54ceabc39627d9ceb578bb5fc4ce3db972b2ce69"),
    ADDRESS_ZERO: getAddress("0x0000000000000000000000000000000000000000"),
  },
  rinkeby: {},
};

const selectedNetwork = "sepolia";

export const TOKEN_FACTORY = networkAddresses[selectedNetwork].TOKEN_FACTORY;

export const EXCHANGE_ADDRESS =
  networkAddresses[selectedNetwork].EXCHANGE_ADDRESS;

export const MEOW_ADDRESS = networkAddresses[selectedNetwork].MEOW_ADDRESS;

export const ADDRESS_ZERO = networkAddresses[selectedNetwork].ADDRESS_ZERO;
