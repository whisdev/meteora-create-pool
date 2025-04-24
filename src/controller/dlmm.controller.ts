import { NextFunction, Request, Response } from "express";
import DLMM, { ActivationType } from "@meteora-ag/dlmm";
import { env } from "../config";
import { BN } from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";

interface inputProps {
  tokenA: string;
  tokenB: string;
  binStep: number;
  initialPrice: number;
  feeBps: number;
}

export const createDLMMPool = async (
  res: Response,
  req: Request,
  next: NextFunction
) => {
  try {
    const { binStep, tokenA, tokenB, initialPrice, feeBps } =
      req.body as unknown as inputProps;

    const tokenAMint = new PublicKey(tokenA);
    const tokenBMint = new PublicKey(tokenB);

    const tokenAInfo = await getMint(env.connection, tokenAMint);
    const tokenBInfo = await getMint(env.connection, tokenBMint);

    const initPrice = DLMM.getPricePerLamport(
      tokenAInfo.decimals,
      tokenBInfo.decimals,
      initialPrice
    );

    const activateBinId = DLMM.getBinIdFromPrice(initPrice, binStep, true);

    const tx = await DLMM.createCustomizablePermissionlessLbPair2(
      env.connection,
      new BN(binStep),
      tokenAMint,
      tokenBMint,
      new BN(activateBinId.toString()),
      new BN(feeBps),
      0,
      false,
      env.keyPair.publicKey
    );
  } catch (error) {
    next(error);
  }
};
