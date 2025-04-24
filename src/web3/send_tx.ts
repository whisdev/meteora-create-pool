import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  Signer,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

import { env } from "../config";

export interface PriorityFeeResponse {
  jsonrpc: string;
  id: string;
  method: string;
  params: Array<{
    transaction: string;
    options: { priorityLevel: string };
  }>;
}

const feeTiers = {
  min: 0.01,
  mid: 0.5,
  max: 0.95,
};

export const getComputeBudgetInstructions = async (
  instructions: TransactionInstruction[],
  feeTier: keyof typeof feeTiers
): Promise<{
  blockhash: string;
  computeBudgetLimitInstruction: TransactionInstruction;
  computeBudgetPriorityFeeInstructions: TransactionInstruction;
}> => {
  const { blockhash, lastValidBlockHeight } =
    await env.connection.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: env.mainWallet,
    recentBlockhash: blockhash,
    instructions: instructions,
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);
  const simulatedTx = env.connection.simulateTransaction(transaction);
  const estimatedComputeUnits = (await simulatedTx).value.unitsConsumed;
  const safeComputeUnits = Math.ceil(
    estimatedComputeUnits
      ? Math.max(estimatedComputeUnits + 100000, estimatedComputeUnits * 1.2)
      : 200000
  );
  const computeBudgetLimitInstruction =
    ComputeBudgetProgram.setComputeUnitLimit({
      units: safeComputeUnits,
    });

  let priorityFee: number;

  const legacyTransaction = new Transaction();
  legacyTransaction.recentBlockhash = blockhash;
  legacyTransaction.lastValidBlockHeight = lastValidBlockHeight;
  legacyTransaction.feePayer = env.mainWallet;

  legacyTransaction.add(computeBudgetLimitInstruction, ...instructions);
  legacyTransaction.sign(env.keyPair);

  const response = await fetch(
    `https://devnet.helius-rpc.com/?api-key=c468ac4b-f75f-422d-b7c2-b965484d3eaf`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getPriorityFeeEstimate",
        params: [
          {
            transaction: bs58.encode(legacyTransaction.serialize()),
            options: {
              priorityLevel:
                feeTier === "min"
                  ? "Min"
                  : feeTier === "mid"
                  ? "Medium"
                  : "High",
            },
          },
        ],
      } as PriorityFeeResponse),
    }
  );

  const data = await response.json();
  if (data.error) {
    throw new Error("Error fetching priority fee from Helius API");
  }
  priorityFee = data.result.priorityFeeEstimate;

  const computeBudgetPriorityFeeInstructions =
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    });

  return {
    blockhash,
    computeBudgetLimitInstruction,
    computeBudgetPriorityFeeInstructions,
  };
};

export const sendTx = async (
  instructions: TransactionInstruction[],
  otherKeypairs?: Keypair[]
) => {
  const ixComputeBudget = await getComputeBudgetInstructions(
    instructions,
    "mid"
  );
  const allInstructions = [
    ixComputeBudget.computeBudgetLimitInstruction,
    ixComputeBudget.computeBudgetPriorityFeeInstructions,
    ...instructions,
  ];
  const messageV0 = new TransactionMessage({
    payerKey: env.mainWallet,
    recentBlockhash: ixComputeBudget.blockhash,
    instructions: allInstructions,
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);
  transaction.sign([env.mainWallet, ...(otherKeypairs ?? [])] as Signer[]);

  const timeoutMs = 90000;
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const transactionStartTime = Date.now();

    const signature = await env.connection.sendTransaction(transaction, {
      maxRetries: 0,
      skipPreflight: false,
    });

    const statuses = await env.connection.getSignatureStatuses([signature]);
    if (statuses.value[0]) {
      if (!statuses.value[0].err) {
        return signature;
      } else {
        throw new Error(
          `Transaction failed: ${statuses.value[0].err.toString()}`
        );
      }
    }

    const elapsedTime = Date.now() - transactionStartTime;
    const remainingTime = Math.max(0, 1000 - elapsedTime);
    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }
  }
  throw new Error("Transaction timeout");
};
