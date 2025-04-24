import AmmImpl from "@meteora-ag/dynamic-amm-sdk";
import {
  PROGRAM_ID,
  SEEDS,
} from "@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm/constants";
import {
  derivePoolAddressWithConfig,
  getAssociatedTokenAccount,
} from "@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm/utils";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { env } from "../config";
import { Buffer } from "buffer";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";

const payerWallet = new Wallet(env.keyPair);

const provider = new AnchorProvider(env.connection, payerWallet, {
  commitment: "confirmed",
});

type AllocationByPercentage = {
  address: PublicKey;
  percentage: number;
};

type AllocationByAmount = {
  address: PublicKey;
  amount: BN;
};

function fromAllocationsToAmount(
  lpAmount: BN,
  allocations: AllocationByPercentage[]
): AllocationByAmount[] {
  const sumPercentage = allocations.reduce(
    (partialSum, a) => partialSum + a.percentage,
    0
  );
  if (sumPercentage === 0) {
    throw Error("sumPercentage is zero");
  }

  let amounts: AllocationByAmount[] = [];
  let sum = new BN(0);
  for (let i = 0; i < allocations.length - 1; i++) {
    const amount = lpAmount
      .mul(new BN(allocations[i].percentage))
      .div(new BN(sumPercentage));
    sum = sum.add(amount);
    amounts.push({
      address: allocations[i].address,
      amount,
    });
  }
  amounts.push({
    address: allocations[allocations.length - 1].address,
    amount: lpAmount.sub(sum),
  });
  return amounts;
}

export const createPoolAndLockLiquidity = async (
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  AAmount: number,
  BAmount: number,
  ADecimal: number,
  BDecimal: number,
  config: PublicKey,
  allocations: AllocationByPercentage[]
) => {
  const programID = new PublicKey(PROGRAM_ID);
  const poolPubkey = derivePoolAddressWithConfig(
    tokenAMint,
    tokenBMint,
    config,
    programID
  );

  // Convert amounts to BN
  const tokenAAmount = new BN(AAmount * 10 ** ADecimal);
  const tokenBAmount = new BN(BAmount * 10 ** BDecimal);

  console.log("create pool %s", poolPubkey);

  // Create the pool
  let transactions =
    await AmmImpl.createPermissionlessConstantProductPoolWithConfig(
      // @ts-ignore
      provider.connection,
      env.keyPair.publicKey,
      tokenAMint,
      tokenBMint,
      tokenAAmount,
      tokenBAmount,
      config
    );

  console.log("test transactions");
  for (const transaction of transactions) {
    transaction.sign(payerWallet.payer);
    const txHash = await provider.connection.sendRawTransaction(
      transaction.serialize()
    );
    await provider.connection.confirmTransaction(txHash, "finalized");
    console.log("transaction %s", txHash);
  }

  // Create escrow and lock liquidity
  const [lpMint] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.LP_MINT), poolPubkey.toBuffer()],
    programID
  );
  const payerPoolLp = await getAssociatedTokenAccount(
    lpMint,
    payerWallet.publicKey
  );
  const payerPoolLpBalance = (
    await provider.connection.getTokenAccountBalance(payerPoolLp)
  ).value.amount;
  console.log("payerPoolLpBalance %s", payerPoolLpBalance.toString());

  let allocationByAmounts = fromAllocationsToAmount(
    new BN(payerPoolLpBalance),
    allocations
  );
  const pool = await AmmImpl.create(
    // @ts-ignore
    provider.connection,
    poolPubkey
  );

  console.log("allocation length", allocationByAmounts.length);

  for (const allocation of allocationByAmounts) {
    console.log("Lock liquidity %s", allocation.address.toString());
    let transaction = await pool.lockLiquidity(
      allocation.address,
      allocation.amount,
      payerWallet.publicKey
    );
    transaction.sign(payerWallet.payer);
    const txHash = await provider.connection.sendRawTransaction(
      transaction.serialize()
    );
    await provider.connection.confirmTransaction(txHash, "finalized");
    console.log("transaction %s", txHash);
  }

  return true;
};
