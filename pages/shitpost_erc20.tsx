import type { NextPage } from "next";
import { MediaRenderer, useAddress } from "@thirdweb-dev/react"
import styles from "../styles/Home.module.css";
import { useRef, useState } from "react";
import axios from "axios";
import {
    useLazyMint,
    useContract,
    Web3Button,
} from "@thirdweb-dev/react";
import { MARKETPLACE_ADDRESS_ERC20 } from "../const/contractAddresses";
import toast from "react-hot-toast";

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

interface ShitPostERC20 {
    file: File,
    shitpostName: string,
    shitpostDescription: string
}

const ShitPostERC20 = ({ file, shitpostName, shitpostDescription }: ShitPostERC20) => {
    const { contract } = useContract(MARKETPLACE_ADDRESS_ERC20);
    const {
        mutateAsync: lazyMint,
        isLoading,
        error,
    } = useLazyMint(contract);

    const mintNFT = async () => {
        try {

            if (file === null) {
                toast.error("Invalid Image");
                return;
            }

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
