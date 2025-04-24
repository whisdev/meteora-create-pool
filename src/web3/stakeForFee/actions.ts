import { derivePoolAddressWithConfig } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils";
import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import StakeForFee, {
  deriveFeeVault,
  DYNAMIC_AMM_PROGRAM_ID,
  STAKE_FOR_FEE_PROGRAM_ID,
} from "@meteora-ag/m3m3";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import BN from "bn.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import Decimal from "decimal.js";

import { handleSendTransaction } from "./utils";
import { env } from "../../config";

export async function createPool(
  keypair: Keypair,
  mintA: PublicKey,
  mintB: PublicKey,
  amountA: BN,
  amountB: BN,
  poolConfigKey: PublicKey
) {
  // Validate inputs
  if (amountA.isNeg() || amountB.isNeg()) {
    throw new Error("Amounts must be non-negative");
  }
  if (amountA.isZero() || amountB.isZero()) {
    throw new Error("Amounts must be greater than zero");
  }

  const transactions =
    await AmmImpl.createPermissionlessConstantProductPoolWithConfig2(
      // @ts-ignore
      env.connection,
      keypair.publicKey,
      mintA,
      mintB,
      amountA,
      amountB,
      poolConfigKey,
      {
        cluster: "devnet",
      }
    );

  for (const [index, tx] of transactions.entries()) {
    const signature = await handleSendTransaction(tx, keypair);
    console.log(`Create Pool Signature ${index + 1}`, signature);
  }

  const poolKey = derivePoolAddressWithConfig(
    mintA,
    mintB,
    poolConfigKey,
    DYNAMIC_AMM_PROGRAM_ID
  );

  return poolKey;
}

export async function createFeeVault(
  poolKey: PublicKey,
  stakeMint: PublicKey,
  keypair: Keypair,
  topListLength: number,
  unstakeLockDuration: BN,
  secondsToFullUnlock: BN,
  startFeeDistributeTimestamp: BN
) {
  const createTx = await StakeForFee.createFeeVault(
    env.connection,
    poolKey,
    stakeMint,
    keypair.publicKey,
    // @ts-ignore
    {
      topListLength,
      unstakeLockDuration,
      secondsToFullUnlock,
      startFeeDistributeTimestamp,
    }
  );

  const latestBlockhash = await env.connection.getLatestBlockhash();
  const tx = new Transaction({
    feePayer: keypair.publicKey,
    ...latestBlockhash,
  }).add(createTx);

  tx.sign(keypair);

  const signature = await env.connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
  });

  console.log("Create FeeVault Signature", signature);
  await env.connection.confirmTransaction({
    signature,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    blockhash: latestBlockhash.blockhash,
  });
}

export async function lockLiquidityToFeeVault(
  poolKey: PublicKey,
  pool: AmmImpl,
  keypair: Keypair,
  lockBps: number
) {
  const feeVaultKey = deriveFeeVault(poolKey, STAKE_FOR_FEE_PROGRAM_ID);

  const poolLpAta = getAssociatedTokenAddressSync(
    pool.poolState.lpMint,
    keypair.publicKey
  );

  const lpAmount = await env.connection
    .getTokenAccountBalance(poolLpAta)
    .then(
      (info: { value: { amount: string } }) =>
        new BN(info.value.amount.toString())
    );

  const lockBpsBN = new BN(Math.min(10_000, lockBps));
  const lockAmount = lpAmount.mul(lockBpsBN).div(new BN(10_000));

  const lockTx = await pool.lockLiquidity(
    feeVaultKey,
    lockAmount,
    keypair.publicKey,
    {
      stakeLiquidity: {
        ratio: new Decimal(1), // 0 to 1; 1 means 100%
      },
    }
  );

  const latestBlockhash = await env.connection.getLatestBlockhash();
  const tx = new Transaction({
    feePayer: keypair.publicKey,
    ...latestBlockhash,
  }).add(lockTx);

  tx.sign(keypair);

  const signature = await env.connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
  });

  console.log("Create FeeVault Signature", signature);
  await env.connection.confirmTransaction({
    signature,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    blockhash: latestBlockhash.blockhash,
  });
}
