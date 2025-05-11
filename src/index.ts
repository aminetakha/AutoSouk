import "dotenv/config";
import express from "express";
import { app } from "./app";
import router from "./routes";

const main = async () => {
  app.use(express.json());
  app.use(router);

  app.listen(process.env.SERVER_PORT, () => {
    console.log("Server is running...");
  });
};

main();
