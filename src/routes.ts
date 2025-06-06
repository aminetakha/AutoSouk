import express from "express";
import authRouter from "./api/auth/routes";

const router = express.Router();

router.use("/api/auth", authRouter);

export default router;
