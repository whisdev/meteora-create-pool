import dotenv from "dotenv-log";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

import { logger } from "./logger";

dotenv.config();

const requiredEnvVariables = ["SOLANA_PRIVATE_KEY", "RPC_URL", "MAIN_WALLET"];

requiredEnvVariables.forEach((key) => {
  if (!process.env[key]) {
    logger.error(`Environment variable ${key} is missing`);
  }
});

const keypair = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATE_KEY!)
);

const connection = new Connection(process.env.RPC_URL!);
const configKey = "FiENCCbPi3rFh5pW2AJ59HC53yM32eLaCjMKxRqanKFJ";

export const env = {
  host: process.env.HOST || "0.0.0.0",
  port: process.env.PORT || 4000,
  rpc: process.env.RPC_URL as string,
  keyPair: keypair as Keypair,
  mainWallet: new PublicKey(process.env.MAIN_WALLET!),
  connection: connection,
  configKey: configKey
};
