import { NextFunction, Request, Response } from "express";

import { logger } from "../config";
import { deploy_token } from "../web3/deploy_token";

export const createToken = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { mint: tokenAMint } = await deploy_token(
      "TESTSatoly",
      "www.ex.com",
      "TESTSA",
      8,
      100_000_000
    );

    // const { mint: tokenBMint } = await deploy_token(
    //   "token_++_mint",
    //   "www.example.com",
    //   "======",
    //   8,
    //   100_000_000
    // );

    res.status(201).json({
      message: `Test token created: TokenA: ${tokenAMint}-100000`,
    });
  } catch (error) {
    logger.error("");
    next(error);
  }
};
