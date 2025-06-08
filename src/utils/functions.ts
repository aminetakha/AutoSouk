import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import ejs from "ejs";
import nodemailer from "nodemailer";
import Mail, { Attachment } from "nodemailer/lib/mailer";

export const generateToken = (size = 32) => {
  return crypto.randomBytes(size).toString("hex");
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

export const readTemplateFile = async (
  fileName: string,
  data: Record<string, unknown>
): Promise<string> => {
  const template = await fs.readFile(
    path.resolve(__dirname, `../templates/${fileName}`),
    { encoding: "utf8" }
  );
  const html = ejs.render(template, data);
  return html;
};

export const readSeedFile = async (fileName: string) => {
  const data = await fs.readFile(
    path.join(__dirname, `../db/seeds/data/${fileName}.json`),
    {
      encoding: "utf8",
    }
  );
  return data;
};
