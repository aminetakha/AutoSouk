import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { usersTable } from "../../db/schema";
import { hashPassword } from "../../utils/functions";
import { registerSchema } from "./request-schema";
import { RequestValidationError } from "../../errors/request-validation-error";
import { BadRequestError } from "../../errors/bad-request-error";

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (result.error) {
    throw new RequestValidationError(result.error.errors);
  }

  const { email, password, city, firstName, lastName, phone, userType } =
    result.data;
  const found = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (found.length > 0) {
    throw new BadRequestError("Email in use");
  }

  const { hashedPassword, salt } = await hashPassword(password);

  await db.insert(usersTable).values({
    email,
    password: hashedPassword,
    salt,
    city,
    firstName,
    lastName,
    phone,
    role: userType,
  });

  res.status(201).json({ message: "Account was created" });
});

authRouter.post("/login", (req, res) => {
  res.send("Login handler");
});

export default authRouter;
