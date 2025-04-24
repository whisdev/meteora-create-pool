import { Request, Response, NextFunction } from "express";

import { logger } from "../config";

export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  logger.info(
    `Request - Method: ${req.method}, Route: ${req.originalUrl}, IP: ${req.ip}`
  );
  next();
};
