import { Sepolia } from "@thirdweb-dev/chains";
import { createThirdwebClient, getContract, ThirdwebContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";

/** Replace the values below with the addresses of your smart contracts. */

// 1. Set up the network your smart contracts are deployed to.
// First, import the chain from the package, then set the NETWORK variable to the chain.

// export const NETWORK = Ethereum;
export const NETWORK = Sepolia;

// 2. The address of the marketplace V3 smart contract.
// Deploy your own: https://thirdweb.com/thirdweb.eth/MarketplaceV3
// export const MARKETPLACE_ADDRESS = "0x766720840323E70FDCB89f9aB6F1F644bDfb5c04";

export const MARKETPLACE_ADDRESS = "0xb7eC137c578BC8ceCdfd4CCb45BADf72Fe2b2654";
export const MARKETPLACE_ADDRESS_ERC20 =
  "0x1554e861CEd0aCDc6ee18586605c1627f55C800e";
// 3. The address of your NFT collection smart contract.
export const NFT_COLLECTION_ADDRESS =
  "0x9e7f9DF1Cb780609aD3A69cacf4a50DD29004206";

// (Optional) Set up the URL of where users can view transactions on
// For example, below, we use Mumbai.polygonscan to view transactions on the Mumbai testnet.
export const ETHERSCAN_URL =
  "https://etherscan.io/0x766720840323E70FDCB89f9aB6F1F644bDfb5c04";

/* Testnet contract */
export const TESTNET_CONTRACT_ADDRESS =
  "0xBdDC5fF63a01BeAD2C6f6e6F853054A4C6e575D7";

export const twClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID as string,
});

// @ts-expect-error chain doesnt match for some reason
export const twContract: ThirdwebContract = getContract({
  client: twClient,
  chain: sepolia,
  address: TESTNET_CONTRACT_ADDRESS,
});
