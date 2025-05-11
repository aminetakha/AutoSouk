import { Router } from "express";

const authRouter = Router();

authRouter.post("/register", (req, res) => {
  res.send("Register handler");
});

authRouter.post("/login", (req, res) => {
  res.send("Login handler");
});

export default authRouter;
