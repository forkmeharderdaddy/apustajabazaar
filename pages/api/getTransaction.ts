import { NextApiRequest, NextApiResponse } from "next";
import { privateKeyToAccount } from "thirdweb/wallets";
import { twClient, twContract } from "../../const/contractAddresses";
import { isAddress } from "thirdweb";
import multiparty from "multiparty";
import { generateMintSignature } from "thirdweb/extensions/erc721";
import axios from "axios";
import * as fs from "node:fs";

// @ts-expect-error for stringifying bigint to json
BigInt.prototype["toJSON"] = function () {
  return this.toString();
};

// needed for form uploading
export const config = {
  api: {
    bodyParser: false,
  },
};

const wallet = privateKeyToAccount({
  privateKey: process.env.WALLET_PRIVATE_KEY as string,
  client: twClient,
});

const JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";

export default async function getTransaction(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const form = new multiparty.Form();
  const data: { fields: any; files: any } = await new Promise(
    (resolve, reject) => {
      form.parse(req, function (err, fields, files) {
        if (err) reject({ err });
        resolve({ fields, files });
      });
    },
  );

  const address = data.fields.address[0];
  const name = data.fields.name[0];
  const description = data.fields.description[0];
  const image = data.files.image[0];

  if (!address || !isAddress(address)) {
    return res.status(400).json("invalid address");
  }

  if (!name || !description || !image) {
    return res.status(400).json("invalid metadata");
  }

  try {
    const fileContent = await fs.promises.readFile(image.path);
    const fileBlob = new Blob([fileContent], {
      type: image.headers["content-type"],
    });

    const formData = new FormData();
    formData.append("file", fileBlob, image.originalFilename);
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

    const { data: ipfs_data } = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${JWT}`,
        },
      },
    );

    const response = await generateMintSignature({
      account: wallet,
      contract: twContract,
      mintRequest: {
        to: address,
        metadata: {
          name,
          description,
          image: `ipfs://${ipfs_data.IpfsHash}`,
        },
      },
    });

    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
