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

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";


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
