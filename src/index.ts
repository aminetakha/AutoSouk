import "dotenv/config";
import { app } from "./app";
import { seeds } from "./db/seeds";

const main = async () => {
  await seeds();
  app.listen(process.env.SERVER_PORT, () => {
    console.log("Server is running...");
  });
};

main();
