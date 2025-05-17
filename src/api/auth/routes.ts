import { Router } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { usersTable } from "../../db/schema";
import { hashPassword } from "../../utils/functions";

const authRouter = Router();

const registerSchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(10),
  userType: z.enum(["buyer", "seller", "mechanic"]),
  city: z.string().min(3),
});

authRouter.post("/register", async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (result.error) {
      res.status(400).json(result.error.errors);
      return;
    }

    const { email, password, city, firstName, lastName, phone, userType } =
      result.data;
    const found = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (found.length > 0) {
      res.status(400).json({ message: "Email is taken" });
      return;
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
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

authRouter.post("/login", (req, res) => {
  res.send("Login handler");
});

export default authRouter;
