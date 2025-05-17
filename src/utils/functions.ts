import crypto from "crypto";
import { promisify } from "util";

const iterations = 100000;
const keyLength = 64;
const digest = "sha512";

const pbkdf2 = promisify(crypto.pbkdf2);

export const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = await pbkdf2(
    password,
    salt,
    iterations,
    keyLength,
    digest
  );
  return { salt, hashedPassword: hashedPassword.toString("hex") };
};
