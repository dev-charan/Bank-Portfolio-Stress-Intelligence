// src/middlewares/validator.ts
import { Request, Response, NextFunction } from "express";

export const validateFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.file && !req.body.data) {
    return res.status(400).json({
      success: false,
      message: "No file or data provided",
    });
  }
  next();
};
