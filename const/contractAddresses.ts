/** Replace the values below with the addresses of your smart contracts. */

// 1. Set up the network your smart contracts are deployed to.
// First, import the chain from the package, then set the NETWORK variable to the chain.
import { Ethereum, Mumbai } from "@thirdweb-dev/chains";
export const NETWORK = Mumbai;

// 2. The address of the marketplace V3 smart contract.
// Deploy your own: https://thirdweb.com/thirdweb.eth/MarketplaceV3
// export const MARKETPLACE_ADDRESS = "0x766720840323E70FDCB89f9aB6F1F644bDfb5c04";

export const MARKETPLACE_ADDRESS = "0x5f959A1e2B05923BFe1bDa8ab10A369348e65f24";
export const MARKETPLACE_ADDRESS_ERC20 = "0x1D5c3aAe3a294d370C3c23E630cE0aBA54ba4398";
// 3. The address of your NFT collection smart contract.
export const NFT_COLLECTION_ADDRESS =
  "0x9e7f9DF1Cb780609aD3A69cacf4a50DD29004206";

// (Optional) Set up the URL of where users can view transactions on
// For example, below, we use Mumbai.polygonscan to view transactions on the Mumbai testnet.
export const ETHERSCAN_URL = "https://etherscan.io/0x766720840323E70FDCB89f9aB6F1F644bDfb5c04";
