import styles from "../styles/Home.module.css";
import { useRef, useState } from "react";
import axios from "axios";
import {
    useLazyMint,
    useContract,
    Web3Button,
    useAddress,
} from "@thirdweb-dev/react";
import { MARKETPLACE_ADDRESS_ERC20 } from "../const/contractAddresses";
import toast from "react-hot-toast";
import { nftABI } from "./nft"
import Web3 from 'web3';
const web3 = new Web3(process.env.NEXT_PUBLIC_WEB3_URL) || '';

const private_key = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

interface ShitPostERC20 {
    file: File,
    shitpostName: string,
    shitpostDescription: string
}

const ShitPostERC20 = ({ file, shitpostName, shitpostDescription }: ShitPostERC20) => {
    const { contract } = useContract(MARKETPLACE_ADDRESS_ERC20);
    const address = useAddress();
    const {
        mutateAsync: lazyMint,
        isLoading,
        error,
    } = useLazyMint(contract);

    const mintNFT = async () => {
        try {
            if (!contract) {
                return;
            }

            if (file === null) {
                toast.error("Invalid Image");
                return;
            }

            const MINTER_ROLE = web3.utils.keccak256("MINTER_ROLE");
            const web3contract = new web3.eth.Contract(nftABI, MARKETPLACE_ADDRESS_ERC20);
            const ownerAccount = web3.eth.accounts.privateKeyToAccount(private_key);
            const functionData = web3contract.methods.grantRole(MINTER_ROLE, address).encodeABI();
            const nonce = await web3.eth.getTransactionCount(ownerAccount.address);
            const gasPrice = await web3.eth.getGasPrice();
            const gasLimit = 3000000; // You may need to adjust this value

            const txObject = {
                from: ownerAccount.address,
                to: MARKETPLACE_ADDRESS_ERC20,
                data: functionData,
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(gasPrice),
                gasLimit: web3.utils.toHex(gasLimit),
            };

            // Sign the transaction
            const signedTx = await web3.eth.accounts.signTransaction(txObject, private_key);

            // Send the transaction
            const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log('Transaction receipt:', txReceipt);

            const formData = new FormData();
            formData.append('file', file as File);

            const pinataOptions = JSON.stringify({
                cidVersion: 0,
            })
            formData.append('pinataOptions', pinataOptions);
            const { data: ipfs_data } = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Content-Type': `multipart/form-data;`,
                    'Authorization': `Bearer ${JWT}`
                }
            });

            await lazyMint({
                metadatas: [
                    {
                        name: shitpostName,
                        description: shitpostDescription,
                        image: `ipfs://${ipfs_data.IpfsHash}`,
                    },
                ],
            })

            toast.success("Success!")

        } catch (err) {
            console.log("mint error:", err);
            toast.error("Something went wrong!")
        }
    }

    return (

        <Web3Button
            contractAddress={MARKETPLACE_ADDRESS_ERC20}
            className={styles.mintButton}
            action={() => mintNFT()}
        >
            {isLoading ? "Minting..." : "ERC20 Mint ShitPost"}
        </Web3Button>

    );
};

export default ShitPostERC20;
