import "dotenv/config";
import express from "express";
import { app } from "./app";
import router from "./routes";
import errorHandler from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const main = async () => {
  app.use(express.json());
  app.use(router);

  // catch all non existante routes and send 404
  app.all("/{*splat}", () => {
    throw new NotFoundError();
  });

  app.use(errorHandler);

  app.listen(process.env.SERVER_PORT, () => {
    console.log("Server is running...");
  });
};

main();
