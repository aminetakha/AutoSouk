import crypto from "crypto";
import { promisify } from "util";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { generateToken } from "../../utils/functions";
import { usersTable } from "../../db/schema/user";

const iterations = 100000;
const keyLength = 64;
const digest = "sha512";

const pbkdf2 = promisify(crypto.pbkdf2);

export const generatePassword = async (password: string, salt: string) => {
  const hash = await pbkdf2(password, salt, iterations, keyLength, digest);
  return hash.toString("hex");
};

export const hashPassword = async (password: string) => {
  const salt = generateToken(16);
  const hashedPassword = await generatePassword(password, salt);
  return { salt, hashedPassword };
};

export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string,
  salt: string
) => {
  const hash = await generatePassword(plainPassword, salt);
  return hash === hashedPassword;
};

export const generateJWT = async (
  payload: string | Buffer | object,
  expiresIn: number
) => {
  return new Promise<string | undefined>((resolve, reject) => {
    sign(payload, process.env.JWT_SECRET!, { expiresIn }, (err, encoded) => {
      if (err) {
        return reject(err);
      }
      resolve(encoded);
    });
  });
};

export const verifyJWT = <T>(token: string): Promise<JwtPayload & T> => {
  return new Promise((resolve, reject) => {
    verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err || !decoded) {
        return reject(err);
      }
      resolve(decoded as JwtPayload & T);
    });
  });
};

export const sanitizeUser = (
  user: typeof usersTable.$inferSelect
): Omit<typeof user, "password" | "salt" | "updatedAt" | "createdAt"> => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    city: user.city,
    imageUrl: user.imageUrl,
    isVerified: user.isVerified,
    phone: user.phone,
    role: user.role,
  };
};
