import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { CustomizableParams } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/types";

import { env } from "../config";
import { sendTx } from "./send_tx";

export const createPool = async (
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  tokenAAmount: BN,
  tokenBAmount: BN,
  customizableParams: CustomizableParams
): Promise<string> => {
  const initPoolTx =
    await AmmImpl.createCustomizablePermissionlessConstantProductPool(
      env.connection,
      env.mainWallet,
      tokenAMint,
      tokenBMint,
      tokenAAmount,
      tokenBAmount,
      customizableParams
    );

  const initPoolTxHash = await sendTx(initPoolTx.instructions, [env.keyPair]);

  return initPoolTxHash;
};

export const createStakeForFee = async () => {};
