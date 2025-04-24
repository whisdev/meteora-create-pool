import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { PublicKey } from "@solana/web3.js";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
  createFungible,
  mintV1,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";

import { env } from "../config";

export const deploy_token = (
  name: string,
  uri: string,
  symbol: string,
  decimals: number = 9,
  initialSupply?: number
): Promise<{ mint: PublicKey }> => {
  try {
    const umi = createUmi(env.connection).use(mplToolbox());
    umi.use(keypairIdentity(fromWeb3JsKeypair(env.keyPair)));

    const mint = generateSigner(umi);

    let builder = createFungible(umi, {
      name,
      uri,
      symbol,
      sellerFeeBasisPoints: {
        basisPoints: BigInt(0),
        identifier: "%",
        decimals: 2,
      },
      decimals,
      mint,
    });

    if (initialSupply) {
      builder = builder.add(
        mintV1(umi, {
          mint: mint.publicKey,
          tokenStandard: TokenStandard.Fungible,
          tokenOwner: fromWeb3JsPublicKey(env.mainWallet),
          amount: initialSupply * Math.pow(10, decimals),
        })
      );
    }

    builder.sendAndConfirm(umi, { confirm: { commitment: "finalized" } });

    return Promise.resolve({
      mint: toWeb3JsPublicKey(mint.publicKey),
    });
  } catch (error: any) {
    throw new Error(`Token deployment failed: ${error.message}`);
  }
};
