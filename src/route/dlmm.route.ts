import { Router } from "express";
import { createDLMMPool } from "../controller/dlmm.controller";

const dlmmRouter = Router();

/**
 * @swagger
 * /api/v1/dlmm/create:
 *   post:
 *     summary: Create a DLMM Pool
 *     description: Creates a DLMM (Dynamic Liquidity Market Maker) pool with the provided parameters.
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
 *               binStep:
 *                 type: number
 *                 description: Bin step size for the pool.
 *                 example: 200
 *               initialPrice:
 *                 type: number
 *                 description: Initial price of token A in terms of token B.
 *                 example: 0.5
 *               feeBps:
 *                 type: number
 *                 description: Fee in basis points (bps).
 *                 example: 30
 *     responses:
 *       201:
 *         description: DLMM pool created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "DLMM pool created"
 *                 data:
 *                   type: string
 *                   description: Transaction hash of the created pool.
 *                   example: "5Yg9Xk3z8V9z1k3z8V9z1k3z8V9z1k3z8V9z1k3z8V9z"
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
dlmmRouter.post("/create", createDLMMPool);

export default dlmmRouter;
