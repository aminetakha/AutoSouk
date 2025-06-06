import "dotenv/config";
import { app } from "./app";

const main = async () => {
  app.listen(process.env.SERVER_PORT, () => {
    console.log("Server is running...");
  });
};

main();
