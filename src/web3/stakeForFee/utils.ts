import { Keypair, Signer, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getOrCreateATAInstruction } from "@meteora-ag/m3m3";
import { env } from "../../config";

export async function initializeMintAndMint(
  mintAuthority: Keypair,
  payer: Keypair,
  decimals: number,
  amount: bigint
) {
  const mintKeypair = Keypair.generate();
  console.log("Initializing Mint:", mintKeypair.publicKey.toBase58());

  const ixs = [];

  const lamports = await getMinimumBalanceForRentExemptMint(env.connection);
  console.log("Lamports for Rent Exemption:", lamports);

  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });

  ixs.push(createAccountIx);

  const createMintIx = createInitializeMintInstruction(
    mintKeypair.publicKey,
    decimals,
    mintAuthority.publicKey,
    null
  );

  ixs.push(createMintIx);

  const { ataPubKey, ix } = await getOrCreateATAInstruction(
    env.connection,
    mintKeypair.publicKey,
    payer.publicKey,
    payer.publicKey,
    true
  );

  console.log("Associated Token Address:", ataPubKey.toBase58());
  ix && ixs.push(ix);

  const mintIx = createMintToInstruction(
    mintKeypair.publicKey,
    ataPubKey,
    mintAuthority.publicKey,
    amount
  );

  ixs.push(mintIx);

  const latestBlockhash = await env.connection.getLatestBlockhash();
  const tx = new Transaction({
    feePayer: payer.publicKey,
    ...latestBlockhash,
  }).add(...ixs);

  tx.sign(mintKeypair, payer);

  const signature = await env.connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
  });

  console.log("Create Mint Signature:", signature);

  await env.connection.confirmTransaction({
    signature,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    blockhash: latestBlockhash.blockhash,
  });

  return mintKeypair.publicKey;
}

export async function handleSendTransaction(
  tx: Transaction,
  signer: Signer | Signer[]
) {
  console.log("tsx", tx, signer);
  const signers = Array.isArray(signer) ? signer : [signer];
  tx.sign(...signers);
  const signature = await env.connection.sendRawTransaction(tx.serialize());
  await env.connection.confirmTransaction(signature);

  return signature;
}
