import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../api/auth/services";

export default async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];
  if (!token) {
    return next();
  }

  try {
    const decoded = await verifyJWT<{ id: number; email: string }>(token);
    req.currentUser = {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (error) {
    console.log("Error in current user middleware", error);
  }

  next();
};
