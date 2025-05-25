import fs from "fs/promises";
import path from "path";
import { Router } from "express";
import { eq } from "drizzle-orm";
import ejs from "ejs";
import { db } from "../../db";
import { usersTable } from "../../db/schema/user";
import { generateToken, sendMail } from "../../utils/functions";
import {
  loginSchema,
  registerSchema,
  resendTokenSchema,
} from "./request-schema";
import { RequestValidationError } from "../../errors/request-validation-error";
import { BadRequestError } from "../../errors/bad-request-error";
import { emailVerificationTokensTable } from "../../db/schema/email_verification_tokens";
import { NotFoundError } from "../../errors/not-found-error";
import { refreshTokensTable } from "../../db/schema/refresh_tokens";
import {
  generateJWT,
  hashPassword,
  sanitizeUser,
  verifyPassword,
} from "./services";

const tokenExpirationMinutes = 5;

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const validationResult = registerSchema.safeParse(req.body);
  if (validationResult.error) {
    throw new RequestValidationError(validationResult.error.errors);
  }

  const { email, password, city, firstName, lastName, phone, userType } =
    validationResult.data;
  const found = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (found.length > 0) {
    throw new BadRequestError("Email in use");
  }

  const { hashedPassword, salt } = await hashPassword(password);

  const createdUser = await db
    .insert(usersTable)
    .values({
      email,
      password: hashedPassword,
      salt,
      city,
      firstName,
      lastName,
      phone,
      role: userType,
    })
    .returning({ id: usersTable.id });

  const expiresAt = new Date(Date.now() + 1000 * 60 * tokenExpirationMinutes);
  const token = generateToken();

  await db.insert(emailVerificationTokensTable).values({
    userId: createdUser[0].id,
    token,
    expiresAt,
  });

  const registerTemplate = await fs.readFile(
    path.resolve(__dirname, "../../templates/mail/register.ejs"),
    { encoding: "utf8" }
  );
  const registerHTML = ejs.render(registerTemplate, {
    firstName,
    verificationUrl: `http://localhost:8080/api/auth/verify?token=${token}`,
    expiration: `${tokenExpirationMinutes} minutes`,
  });
  await sendMail({
    to: email,
    subject: "Verify Account",
    html: registerHTML,
  });

  res.status(201).json({ message: "Account was created", token });
});

authRouter.get("/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    throw new BadRequestError("Token is required");
  }
  const response = await db
    .select()
    .from(emailVerificationTokensTable)
    .where(eq(emailVerificationTokensTable.token, token as string))
    .limit(1);
  if (response.length === 0) {
    throw new BadRequestError("Invalid token");
  }
  const { expiresAt } = response[0];
  const difference =
    (expiresAt.getTime() - new Date().getTime()) /
    1000 /
    60 /
    tokenExpirationMinutes;
  if (difference <= 0) {
    await db
      .delete(emailVerificationTokensTable)
      .where(eq(emailVerificationTokensTable.token, token as string));
    throw new BadRequestError("Link has been expired");
  }
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, response[0].userId))
    .limit(1);
  if (user.length === 0) {
    throw new NotFoundError();
  }
  if (user[0].isVerified) {
    throw new BadRequestError("User is already verified");
  }
  await db
    .update(usersTable)
    .set({ isVerified: true })
    .where(eq(usersTable.id, response[0].userId));
  await db
    .delete(emailVerificationTokensTable)
    .where(eq(emailVerificationTokensTable.token, token as string));

  res.status(200).json({ message: "Verified with success" });
});

authRouter.post("/re-verify", async (req, res) => {
  const validationResult = resendTokenSchema.safeParse(req.body);
  if (validationResult.error) {
    throw new RequestValidationError(validationResult.error.errors);
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, validationResult.data.email))
    .limit(1);
  if (user.length === 0) {
    throw new NotFoundError("No account was found with this email");
  }
  if (user[0].isVerified) {
    throw new BadRequestError("User is already verified");
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * tokenExpirationMinutes);
  const token = generateToken();

  await db.insert(emailVerificationTokensTable).values({
    userId: user[0].id,
    token,
    expiresAt,
  });

  const registerTemplate = await fs.readFile(
    path.resolve(__dirname, "../../templates/mail/register.ejs"),
    { encoding: "utf8" }
  );
  const registerHTML = ejs.render(registerTemplate, {
    firstName: user[0].firstName,
    verificationUrl: `http://localhost:8080/api/auth/verify?token=${token}`,
    expiration: `${tokenExpirationMinutes} minutes`,
  });
  await sendMail({
    to: user[0].email,
    subject: "Verify Account",
    html: registerHTML,
  });
  res.status(200).json({ message: "A verification email has been sent" });
});

authRouter.post("/login", async (req, res) => {
  const validateResult = loginSchema.safeParse(req.body);
  if (validateResult.error) {
    throw new RequestValidationError(validateResult.error.errors);
  }
  const { email, password } = validateResult.data;
  const foundUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (foundUser.length === 0) {
    throw new NotFoundError("Email or password is not correct");
  }

  const { password: storedPassword, salt, ...user } = foundUser[0];
  const isPasswordValid = await verifyPassword(password, storedPassword, salt);

  if (!isPasswordValid) {
    throw new NotFoundError("Email or password is not correct");
  }

  const accessToken = await generateJWT(
    { id: user.id, email: user.email },
    Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION_SECONDS!)
  );
  const refreshToken = await generateJWT(
    { id: user.id, email: user.email },
    Number(process.env.JWT_REFRESH_TOKEN_EXPIRATION_SECONDS!)
  );
  await db
    .insert(refreshTokensTable)
    .values({ userId: user.id, currentToken: refreshToken });
  req.session = {
    refreshToken,
  };
  res.status(200).json({ accessToken, user: sanitizeUser(foundUser[0]) });
});

export default authRouter;
