import { Router } from "express";

import {
  createMemecoinPool,
  createStablePool,
  createStake2EarnPool,
  createVolatilePool,
} from "../controller/amm.controller";

const ammRouter = Router();

/**
 * @swagger
 * /api/v1/amm/createStable:
 *   post:
 *     summary: Create a Stable Pool
 *     description: Creates a stable pool with the provided token and amount parameters.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenA:
 *                 type: string
 *                 description: Public key of token A.
 *                 example: "4sBMz7zmDWPzdEnECJW3NA9mEcNwkjYtVnL2KySaWYAf"
 *               tokenB:
 *                 type: string
 *                 description: Public key of token B.
 *                 example: "CVV5MxfwA24PsM7iuS2ddssYgySf5SxVJ8PpAwGN2yVy"
 *               tokenAAmount:
 *                 type: number
 *                 description: Amount of token A.
 *                 example: 1000
 *               tokenBAmount:
 *                 type: number
 *                 description: Amount of token B.
 *                 example: 2000
 *               fee:
 *                 type: number
 *                 description: Fee in basis points.
 *                 example: 30
 *     responses:
 *       201:
 *         description: Stable pool created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stable pool created successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "transaction_hash"
 *       400:
 *         description: Bad request. Invalid or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input parameters."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */
ammRouter.post("/createStable", createStablePool);

/**
 * @swagger
 * /api/v1/amm/stake2earn:
 *   post:
 *     summary: Create a Stake2Earn Pool
 *     description: Creates a Stake2Earn pool with the provided token and amount parameters.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenA:
 *                 type: string
 *                 description: Public key of token A.
 *                 example: "4sBMz7zmDWPzdEnECJW3NA9mEcNwkjYtVnL2KySaWYAf"
 *               tokenB:
 *                 type: string
 *                 description: Public key of token B.
 *                 example: "CVV5MxfwA24PsM7iuS2ddssYgySf5SxVJ8PpAwGN2yVy"
 *               tokenAAmount:
 *                 type: number
 *                 description: Amount of token A.
 *                 example: 1000
 *               tokenBAmount:
 *                 type: number
 *                 description: Amount of token B.
 *                 example: 2000
 *     responses:
 *       201:
 *         description: Stake2Earn pool created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stake2Earn pool created successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "transaction_hash"
 *       400:
 *         description: Bad request. Invalid or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input parameters."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */
ammRouter.post("/stake2earn", createStake2EarnPool);

/**
 * @swagger
 * /api/v1/amm/memecoin:
 *   post:
 *     summary: Create a Memecoin Pool
 *     description: Creates a Memecoin pool with the provided token and amount parameters.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenA:
 *                 type: string
 *                 description: Public key of token A.
 *                 example: "4sBMz7zmDWPzdEnECJW3NA9mEcNwkjYtVnL2KySaWYAf"
 *               tokenB:
 *                 type: string
 *                 description: Public key of token B.
 *                 example: "CVV5MxfwA24PsM7iuS2ddssYgySf5SxVJ8PpAwGN2yVy"
 *               tokenAAmount:
 *                 type: number
 *                 description: Amount of token A.
 *                 example: 1000
 *               tokenBAmount:
 *                 type: number
 *                 description: Amount of token B.
 *                 example: 2000
 *     responses:
 *       201:
 *         description: Memecoin pool created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Memecoin pool created successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "transaction_hash"
 *       400:
 *         description: Bad request. Invalid or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input parameters."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */
ammRouter.post("/memecoin", createMemecoinPool);

/**
 * @swagger
 * /api/v1/amm/volatile:
 *   post:
 *     summary: Create a Volatile Pool
 *     description: Creates a volatile pool with the provided token and amount parameters.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tokenA:
 *                 type: string
 *                 description: Public key of token A.
 *                 example: "4sBMz7zmDWPzdEnECJW3NA9mEcNwkjYtVnL2KySaWYAf"
 *               tokenB:
 *                 type: string
 *                 description: Public key of token B.
 *                 example: "CVV5MxfwA24PsM7iuS2ddssYgySf5SxVJ8PpAwGN2yVy"
 *               tokenAAmount:
 *                 type: number
 *                 description: Amount of token A.
 *                 example: 1000
 *               tokenBAmount:
 *                 type: number
 *                 description: Amount of token B.
 *                 example: 2000
 *               startTime:
 *                 type: string
 *                 description: Start time for the pool (ISO 8601 format or "now").
 *                 example: "2025-04-23T12:00:00Z"
 *     responses:
 *       201:
 *         description: Volatile pool created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Volatile pool created successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "transaction_hash"
 *       400:
 *         description: Bad request. Invalid or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input parameters."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */
ammRouter.post("/volatile", createVolatilePool);

export default ammRouter;
