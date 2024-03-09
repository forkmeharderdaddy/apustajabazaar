import type { NextPage } from "next";
import { MediaRenderer, useAddress} from "@thirdweb-dev/react"
import styles from "../styles/Home.module.css";
import { useRef, useState } from "react";


const Home: NextPage = () => {
  const address = useAddress();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageURL, setImageUrl] = useState<string | null>(null);
  const [shitpostName, setShitpostName] = useState<string>("");
  const [shitpostDescription, setShitpostDescription] = useState<string>("");
  const [mintingShitpost, setMintingShitpost] = useState<boolean>(false);

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
      processFile(files[0]); // Pass the first file to processFile
    }
  };

  const hadleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const reset = () => {
    setImageUrl(null);
  };

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
          style={{display: "none"}}
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
            <div style={{ height:"100%"}}>
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
        <button
        className={styles.mintButton}
        disabled={mintingShitpost}
        >
            {mintingShitpost ? "Minting..." : "Mint ShitPost"}
        </button>
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
