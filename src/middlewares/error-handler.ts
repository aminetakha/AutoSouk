import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/custom-error";

export default (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("error", err);
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ errors: err.serializeError() });
    return;
  }
  res.status(400).json({ errors: [{ message: "Something went wrong" }] });
};
