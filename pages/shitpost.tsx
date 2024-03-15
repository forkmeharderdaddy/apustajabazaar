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
import { MARKETPLACE_ADDRESS } from "../const/contractAddresses";
import toast from "react-hot-toast";
import ShitPostERC20 from "./shitpost_erc20";
import { nftABI } from "./nft"
import Web3 from 'web3';

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

const web3 = new Web3(process.env.NEXT_PUBLIC_WEB3_URL) || '';

const private_key = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";

const Home: NextPage = () => {
  const { contract } = useContract(MARKETPLACE_ADDRESS);
  const {
    mutateAsync: lazyMint,
    isLoading,
    error,
  } = useLazyMint(contract);
  const address = useAddress();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageURL, setImageUrl] = useState<string | null>(null);
  const [shitpostName, setShitpostName] = useState<string>("");
  const [shitpostDescription, setShitpostDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      processFile(files[0]); // Pass the first file to processFile
    }
  };

  const hadleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const reset = () => {
    setImageUrl(null);
    setFile(null);
  };

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
      const web3contract = new web3.eth.Contract(nftABI, MARKETPLACE_ADDRESS);
      const ownerAccount = web3.eth.accounts.privateKeyToAccount(private_key);
      const functionData = web3contract.methods.grantRole(MINTER_ROLE, address).encodeABI();
      const nonce = await web3.eth.getTransactionCount(ownerAccount.address);
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 3000000; // You may need to adjust this value

      const txObject = {
        from: ownerAccount.address,
        to: MARKETPLACE_ADDRESS,
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
    <div className={styles.container} style={{ marginTop: '100px' }}>
      {address ? (
        <div className={styles.mintContainer}>
          <div className={styles.mintContainerSection}>
            <h1 style={{ marginTop: "60px" }}>ShitPost Image</h1>
            <div
              className={styles.fileContainer}
              onClick={hadleFileSelect}
            >
              <input type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleChange}
              />
              {!imageURL ? (
                <div
                  style={{
                    border: "2px dashed grey",
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <p>Click to upload image</p>
                </div>
              ) : (
                <div style={{ width: "300px", height: "300px", display: "flex", flexDirection: "column", gap: 2 }}>
                  <MediaRenderer
                    src={imageURL}
                    height="100%"
                    width="100%"
                  />
                  <button
                    onClick={reset}
                    className={styles.resetButton}
                  >Reset</button>
                </div>
              )}
            </div>
          </div>
          <div className={styles.mintContainerSection}>
            <h1>ShitPost MetaData</h1>
            <p>ShitPost Name:</p>
            <input
              type="text"
              placeholder="ShitPost Name"
              value={shitpostName}
              onChange={(e) => setShitpostName(e.target.value)}
              className={styles.metadata}
            />
            <p>ShitPost Description:</p>
            <input
              type="text"
              placeholder="This Shitpost eternalizes..."
              value={shitpostDescription}
              onChange={(e) => setShitpostDescription(e.target.value)}
              className={styles.metadataInput}
            />
          </div>
          <div style={{ marginTop: '30px', display: "flex", gap: "5px" }}>
            <Web3Button
              contractAddress={MARKETPLACE_ADDRESS}
              className={styles.mintButton}
              action={() => mintNFT()}
            >
              {isLoading ? "Minting..." : "Mint ShitPost"}
            </Web3Button>
            <ShitPostERC20 file={file as File} shitpostName={shitpostName} shitpostDescription={shitpostDescription} />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '100px' }}>
          <h1>Sign in to mint an NFT</h1>
        </div>
      )}
    </div>
  );
};

export default Home;
