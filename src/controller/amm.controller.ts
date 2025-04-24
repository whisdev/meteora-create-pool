import { NextFunction, Request, Response } from "express";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { env } from "../config";
import { getMint } from "@solana/spl-token";
import AmmImpl, { PROGRAM_ID } from "@meteora-ag/dynamic-amm-sdk";
import { derivePoolAddressWithConfig } from "@meteora-ag/dynamic-amm-sdk/dist/cjs/src/amm/utils";

interface inputProps {
  tokenA: string;
  tokenB: string;
  tokenAAmount: number;
  tokenBAmount: number;
  tradeFeeNumerator: number;
  activationPoint: BN | null;
  hasAlphaVault: boolean;
  activationType: number;
  startTime: string;
  fee: number;
}

export const createStablePool = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tokenA, tokenB, tokenAAmount, tokenBAmount, fee } =
      req.body as unknown as inputProps;

    const tokenAMint = new PublicKey(tokenA);
    const tokenBMint = new PublicKey(tokenB);

    const tokenAInfo = await getMint(env.connection, tokenAMint);
    const tokenBInfo = await getMint(env.connection, tokenBMint);

    const AAmount = new BN(tokenAAmount * 10 ** tokenAInfo.decimals);
    const BAmount = new BN(tokenBAmount * 10 ** tokenBInfo.decimals);

    // const feeBps = new BN(fee);
    // console.log("Fee (bps):", fee);
    // console.log("Fee (BN):", feeBps.toString());

    const feeConfigurations = await AmmImpl.getFeeConfigurations(
      // @ts-ignore
      env.connection,
      {
        programId: new PublicKey(PROGRAM_ID),
      }
    );

    const tradeFeeBps = new BN(fee);

    const transactions = await AmmImpl.createPermissionlessPool(
      env.connection as any,
      env.keyPair.publicKey,
      tokenAMint,
      tokenBMint,
      AAmount,
      BAmount,
      true,
      tradeFeeBps
    );

    let txList: string[] = [];
    for (const transaction of Array.isArray(transactions)
      ? transactions
      : [transactions]) {
      transaction.sign(env.keyPair);
      const txHash = await env.connection.sendRawTransaction(
        transaction.serialize()
      );
      txList.push(txHash);
      await env.connection.confirmTransaction(txHash, "finalized");
      console.log("transaction %s", txHash);
    }
    res.status(201).json({ message: "Stable pool created", data: txList });
  } catch (error) {
    next(error);
  }
};

export const createVolatilePool = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tokenA, tokenB, tokenAAmount, tokenBAmount, startTime } =
      req.body as unknown as inputProps;

    const tokenAMint = new PublicKey(tokenA);
    const tokenBMint = new PublicKey(tokenB);

    const tokenAInfo = await getMint(env.connection, tokenAMint);
    const tokenBInfo = await getMint(env.connection, tokenBMint);

    const AAmount = new BN(tokenAAmount * 10 ** tokenAInfo.decimals);
    const BAmount = new BN(tokenBAmount * 10 ** tokenBInfo.decimals);

    const config = new PublicKey(
      env.configKey
    );

    const programId = new PublicKey(PROGRAM_ID);
    const poolPubkey = derivePoolAddressWithConfig(
      tokenAMint,
      tokenBMint,
      config,
      programId
    );

    console.log("create pool %s", poolPubkey);

    const transactions =
      await AmmImpl.createPermissionlessConstantProductPoolWithConfig2(
        // @ts-ignore
        env.connection,
        env.keyPair.publicKey,
        tokenAMint,
        tokenBMint,
        AAmount,
        BAmount,
        config,
        {
          activationPoint:
            startTime !== "now"
              ? new BN(Math.floor(new Date(startTime).getTime() / 1000))
              : undefined,
        }
      );

    let txList: string[] = [];
    for (const transaction of transactions) {
      transaction.sign(env.keyPair);
      const txHash = await env.connection.sendRawTransaction(
        transaction.serialize()
      );
      await env.connection.confirmTransaction(txHash, "finalized");
      txList.push(txHash);
      console.log("transaction %s", txHash);
    }

    res.status(201).json({ message: "Volatile pool created", data: txList });
  } catch (error) {
    next(error);
  }
};

export const createMemecoinPool = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tokenA, tokenB, tokenAAmount, tokenBAmount } =
      req.body as unknown as inputProps;

    const tokenAMint = new PublicKey(tokenA);
    const tokenBMint = new PublicKey(tokenB);

    const tokenAInfo = await getMint(env.connection, tokenAMint);
    const tokenBInfo = await getMint(env.connection, tokenBMint);

    console.log('tokenAInfo :>> ', tokenAInfo);
    console.log('tokenBInfo :>> ', tokenBInfo);

    const AAmount = new BN(tokenAAmount * 10 ** tokenAInfo.decimals);
    const BAmount = new BN(tokenBAmount * 10 ** tokenBInfo.decimals);

    const config = new PublicKey(
      env.configKey
    );

    const programId = new PublicKey(PROGRAM_ID);

    console.log("Authority PublicKey:", env.keyPair.publicKey.toBase58());
    console.log("Config PublicKey:", config.toBase58());

    const poolAddress = derivePoolAddressWithConfig(
      tokenAMint,
      tokenBMint,
      config,
      programId
    );

    console.log("create pool %s", poolAddress);

    const feeConfigurations = await AmmImpl.getFeeConfigurations(
      // @ts-ignore
      env.connection,
      {
        programId,
      }
    );

    const feeConfig = feeConfigurations.find(({ publicKey }) =>
      publicKey.equals(config)
    );

    if (!feeConfig) {
      throw new Error("No matching fee configuration found.");
    }

    console.log("FeeConfig PublicKey:", feeConfig.publicKey.toBase58());

    const transactions =
      await AmmImpl.createPermissionlessConstantProductMemecoinPoolWithConfig(
        // @ts-ignore
        env.connection,
        env.keyPair.publicKey,
        tokenAMint,
        tokenBMint,
        AAmount,
        BAmount,
        feeConfig?.publicKey,
        { isMinted: true }
      );

    let txList: string[] = [];
    for (const transaction of transactions) {
      transaction.sign(env.keyPair);
      const txHash = await env.connection.sendRawTransaction(
        transaction.serialize()
      );
      await env.connection.confirmTransaction(txHash, "finalized");
      txList.push(txHash);
      console.log("transaction %s", txHash);
    }

    res.status(201).json({ message: "Memecoin pool created", data: txList });
  } catch (error) {
    next(error);
  }
};

export const createStake2EarnPool = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { tokenA, tokenAAmount, tokenB, tokenBAmount } = req.body;

    const tokenAMint = new PublicKey(tokenA);
    const tokenBMint = new PublicKey(tokenB);

    const tokenAInfo = await getMint(env.connection, tokenAMint);
    const tokenBInfo = await getMint(env.connection, tokenBMint);

    const AAmount = new BN(tokenAAmount * 10 ** tokenAInfo.decimals);
    const BAmount = new BN(tokenBAmount * 10 ** tokenBInfo.decimals);

    const config = new PublicKey(
      env.configKey
    );

    const programId = new PublicKey(PROGRAM_ID);

    const poolAddress = derivePoolAddressWithConfig(
      tokenAMint,
      tokenBMint,
      config,
      programId
    );

    console.log("create pool %s", poolAddress);

    const feeConfigurations = await AmmImpl.getFeeConfigurations(
      // @ts-ignore
      env.connection,
      {
        programId,
      }
    );
    const feeConfig = feeConfigurations.find(({ publicKey }) =>
      publicKey.equals(config)
    );

    const transactions =
      await AmmImpl.createPermissionlessConstantProductMemecoinPoolWithConfig(
        // @ts-ignore
        env.connection,
        env.keyPair.publicKey,
        tokenAMint,
        tokenBMint,
        AAmount,
        BAmount,
        feeConfig?.publicKey,
        { isMinted: true }
      );

    let txList: string[] = [];
    for (const transaction of transactions) {
      transaction.sign(env.keyPair);
      const txHash = await env.connection.sendRawTransaction(
        transaction.serialize()
      );
      await env.connection.confirmTransaction(txHash, "finalized");
      txList.push(txHash);
      console.log("transaction %s", txHash);
    }

    // const feeDurationInDays = 7;
    // const numOfStakers = 1000;
    // const feeClaimStartTime = roundToNearestMinutes(new Date(), {
    //   nearestTo: 30,
    // });
    // const cooldownDurationInHours = 6;

    // const m3transactions =
    //   await AmmImpl.createPermissionlessConstantProductMemecoinPoolWithConfig(
    //     env.connection,
    //     env.keyPair.publicKey, // payer
    //     tokenAMint,
    //     tokenBMint,
    //     AAmount,
    //     BAmount,
    //     feeConfig,
    //     { isMinted: true },
    //     {
    //       feeVault: {
    //         secondsToFullUnlock: feeDurationInDays
    //           ? new BN(feeDurationInDays * 86400)
    //           : new BN(0),
    //         topListLength: numOfStakers || 0,
    //         startFeeDistributeTimestamp: feeClaimStartTime
    //           ? new BN(feeClaimStartTime.getTime() / 1000)
    //           : null,
    //         unstakeLockDuration: cooldownDurationInHours
    //           ? new BN(cooldownDurationInHours * 3600)
    //           : new BN(0),
    //       },
    //       // other options
    //     }
    //   );

    // for (const transaction of transactions) {
    //   transaction.sign(mockWallet.payer);
    //   const txHash = await provider.connection.sendRawTransaction(
    //     transaction.serialize()
    //   );
    //   await provider.connection.confirmTransaction(txHash, "finalized");
    //   console.log("transaction %s", txHash);
    // }

    res.status(201).json({ message: "Stake2Earn pool created", data: txList });
  } catch (error) {
    next(error);
  }
};
