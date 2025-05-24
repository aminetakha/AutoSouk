import crypto from "crypto";
import { promisify } from "util";
import nodemailer from "nodemailer";
import Mail, { Attachment } from "nodemailer/lib/mailer";

const iterations = 100000;
const keyLength = 64;
const digest = "sha512";

const pbkdf2 = promisify(crypto.pbkdf2);

export const generateToken = (size = 32) => {
  return crypto.randomBytes(size).toString("hex");
};

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

export const sendMail = async (options: {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
}) => {
  const { SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAILER_FROM } =
    process.env;
  const { attachments, subject, to, from, html, text } = options;
  const transporter = nodemailer.createTransport({
    host: SMTP_SERVER!,
    port: Number(SMTP_PORT!),
    secure: false,
    auth: {
      user: SMTP_USER!,
      pass: SMTP_PASSWORD!,
    },
  });

  const mailOptions: Mail.Options = {
    from: from || MAILER_FROM,
    to,
    subject,
  };

  if (html) {
    mailOptions.html = html;
  }

  if (text) {
    mailOptions.text = text;
  }

  if (attachments) {
    mailOptions.attachments = attachments;
  }

  await transporter.sendMail(mailOptions);
};
