import { PublicKey } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { BN } from "bn.js";

import { env } from "../../config";
import { createFeeVault, createPool, lockLiquidityToFeeVault } from "./actions";

const poolConfigKey = new PublicKey(
  "BdfD7rrTZEWmf8UbEBPVpvM3wUqyrR8swjAy5SNT8gJ2"
);

interface StakeForFeeParams {
  mintA: PublicKey;
  tokenAAmount: number;
  tokenADecimal: number;
  stakeFarmAmount: number;
  tokenBAmount: number;
  tokenBDecimal: number;
}

export const createStakeForFee = async ({
  mintA,
  tokenAAmount,
  tokenADecimal,
  stakeFarmAmount = 1000,
  tokenBAmount,
  tokenBDecimal,
}: StakeForFeeParams) => {
  if (!mintA) {
    throw new Error(
      "mintA and mintB are required and must be valid PublicKey objects."
    );
  }
  if (typeof tokenAAmount !== "number" || typeof tokenBAmount !== "number") {
    throw new Error("tokenAAmount and tokenBAmount must be valid numbers.");
  }

  const amountA = BigInt(tokenAAmount * 10 ** tokenADecimal);
  const amountB = BigInt(tokenBAmount * 10 ** tokenBDecimal);

  const poolKey = await createPool(
    env.keyPair,
    mintA,
    NATIVE_MINT,
    new BN(amountA.toString()),
    new BN(amountB.toString()),
    poolConfigKey
  );

  const pool = await AmmImpl.create(env.connection, poolKey);

  const currentSlot = await env.connection.getSlot("confirmed");
  const currentOnchainTimestamp = await env.connection.getBlockTime(
    currentSlot
  );
  if (currentOnchainTimestamp === null) {
    throw new Error("Failed to fetch the current on-chain timestamp.");
  }
  const topListLength = 10;
  const unstakeLockDuration = new BN(3600 * 24);
  const secondsToFullUnlock = new BN(3600 * 24 * 7);
  const startFeeDistributeTimestamp = new BN(currentOnchainTimestamp + 10); // delay 10 seconds to be able to claim

  await createFeeVault(
    poolKey,
    pool.poolState.tokenAMint,
    env.keyPair,
    topListLength,
    unstakeLockDuration,
    secondsToFullUnlock,
    startFeeDistributeTimestamp
  );

  await lockLiquidityToFeeVault(poolKey, pool, env.keyPair, stakeFarmAmount);
};
