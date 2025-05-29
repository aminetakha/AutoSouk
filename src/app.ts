import express from "express";
import cookieSession from "cookie-session";
import router from "./routes";
import errorHandler from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import currentUser from "./middlewares/current-user";

export const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(
  cookieSession({
    secret: process.env.COOKIE_SECRET,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "none" : "lax",
    secure: process.env.NODE_ENV !== "development",
  })
);
app.use(currentUser);
app.use(router);

// catch all non existante routes and send 404
app.all("/{*splat}", () => {
  throw new NotFoundError();
});

app.use(errorHandler);
