import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useRef, useState } from "react";
import axios from "axios";
import {
  TESTNET_CONTRACT_ADDRESS,
  twClient,
  twContract,
} from "../const/contractAddresses";
import toast from "react-hot-toast";
import {
  generateMintSignature,
  mintWithSignature,
} from "thirdweb/extensions/erc721";
import { MediaRenderer } from "thirdweb/react";
import { useAddress, useSigner, Web3Button } from "@thirdweb-dev/react";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { sendTransaction } from "thirdweb";

const Home: NextPage = () => {
  const address = useAddress();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageURL, setImageUrl] = useState<string | null>(null);
  const [shitpostName, setShitpostName] = useState<string>("");
  const [shitpostDescription, setShitpostDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signer = useSigner();

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

  const mintNftNew = async () => {
    setIsLoading(true);
    try {
      if (!signer) {
        toast.error("Please connect your wallet");
        throw new Error("Please connect your wallet");
      }

      /* Workaround to use V5 */
      const account = await ethers5Adapter.signer.fromEthers({ signer });
      if (!account) {
        toast.error("Please connect your wallet");
        throw new Error("Please connect your wallet");
      }

      if (!file || !file.type.startsWith("image/")) {
        toast.error("Invalid Image");
        throw new Error("Invalid Image");
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("address", account.address);
      formData.append("name", shitpostName);
      formData.append("description", shitpostDescription);

      const { data } = await axios.post<
        Awaited<ReturnType<typeof generateMintSignature>>
      >("/api/getTransaction", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const transaction = mintWithSignature({
        contract: twContract,
        payload: data.payload,
        signature: data.signature,
      });

      await sendTransaction({ transaction, account });
      toast.success(`Shitpost created`);
    } catch (error: unknown) {
      console.error(error);
      toast.error(`An error occured`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container} style={{ marginTop: "100px" }}>
      {address ? (
        <div className={styles.mintContainer}>
          <div className={styles.mintContainerSection}>
            <h1 style={{ marginTop: "60px" }}>ShitPost Image</h1>
            <div className={styles.fileContainer} onClick={hadleFileSelect}>
              <input
                type="file"
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
                <div
                  style={{
                    width: "300px",
                    height: "300px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <MediaRenderer
                    client={twClient}
                    src={imageURL}
                    height="100%"
                    width="100%"
                  />
                  <button onClick={reset} className={styles.resetButton}>
                    Reset
                  </button>
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
          <div style={{ marginTop: "30px", display: "flex", gap: "5px" }}>
            <Web3Button
              contractAddress={TESTNET_CONTRACT_ADDRESS}
              className={styles.mintButton}
              action={() => mintNftNew()}
            >
              {isLoading ? "Minting..." : "Mint ShitPost"}
            </Web3Button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: "100px" }}>
          <h1>Sign in to mint an NFT</h1>
        </div>
      )}
    </div>
  );
};

export default Home;
