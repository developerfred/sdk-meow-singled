import { Address, getAddress } from "viem";

interface NetworkAddresses {
  [key: string]: {
    TOKEN_FACTORY: Address;
    EXCHANGE_ADDRESS: Address;
    MEOW_ADDRESS: Address;
    ADDRESS_ZERO: Address;
  };
}

const networkAddresses: NetworkAddresses = {
  mainnet: {
    TOKEN_FACTORY: getAddress("0x927294e922c3f8FbdC34Bd8b1875aE3D3e1637dF"),
    EXCHANGE_ADDRESS: getAddress("0x6dba9e1d90afa4a97e2a819bcc1ad22deaf81794"),
    MEOW_ADDRESS: getAddress("0x54ceabc39627d9ceb578bb5fc4ce3db972b2ce69"),
    ADDRESS_ZERO: getAddress("0x0000000000000000000000000000000000000000"),
  },
  sepolia: {
    TOKEN_FACTORY: getAddress("0xcfFa6a5951B3b01B1b08E386Ac1fb4B567eCc9fD"),
    EXCHANGE_ADDRESS: getAddress("0x2c4145a98611B2Dc6Ecfcd0bcc2A2f841E0916BF"),
    MEOW_ADDRESS: getAddress("0x54ceabc39627d9ceb578bb5fc4ce3db972b2ce69"),
    ADDRESS_ZERO: getAddress("0x0000000000000000000000000000000000000000"),
  },
  rinkeby: {
    TOKEN_FACTORY: getAddress("0x0000000000000000000000000000000000000000"),
    EXCHANGE_ADDRESS: getAddress("0x0000000000000000000000000000000000000000"),
    MEOW_ADDRESS: getAddress("0x0000000000000000000000000000000000000000"),
    ADDRESS_ZERO: getAddress("0x0000000000000000000000000000000000000000"),
  },
};

const getNetworkAddresses = (selectedNetwork: keyof NetworkAddresses) => {
  const addresses = networkAddresses[selectedNetwork];
  if (!addresses) {
    throw new Error(`Network "${selectedNetwork}" not supported.`);
  }
  return addresses;
};

const selectedNetwork = "sepolia" as keyof NetworkAddresses;
const { TOKEN_FACTORY, EXCHANGE_ADDRESS, MEOW_ADDRESS, ADDRESS_ZERO } = getNetworkAddresses(selectedNetwork);

export { TOKEN_FACTORY, EXCHANGE_ADDRESS, MEOW_ADDRESS, ADDRESS_ZERO };
