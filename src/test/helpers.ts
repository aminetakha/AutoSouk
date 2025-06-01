import url from "url";
import request from "supertest";
import { app } from "../app";
import { readTemplateFile } from "../utils/functions";

export const signupUser = async (options?: {
  userType?: "buyer" | "seller" | "mechanic" | "admin";
  email?: string;
}) => {
  const { email = "user@example.com", userType = "buyer" } = options || {};
  const formData = {
    firstName: "John",
    lastName: "Doe",
    email,
    password: "USEr_@@852852",
    phone: "+212685412593",
    userType,
    city: "Tangier",
  };
  const response = await request(app).post("/api/auth/register").send(formData);

  return {
    formData,
    statusCode: response.statusCode,
    responseBody: response.body,
  };
};

export const signupUserWithVerification = async (options?: {
  userType?: "buyer" | "seller" | "mechanic" | "admin";
  email?: string;
}) => {
  const { email = "user@example.com", userType = "buyer" } = options || {};
  const formData = {
    firstName: "John",
    lastName: "Doe",
    email,
    password: "USEr_@@852852",
    phone: "+212685412593",
    userType,
    city: "Tangier",
  };
  const response = await request(app).post("/api/auth/register").send(formData);
  const { verificationUrl } = (readTemplateFile as jest.Mock).mock.calls[0][1];
  const token = url.parse(verificationUrl, true).query.token as string;
  await request(app).get(`/api/auth/verify?token=${token}`).send().expect(200);

  return {
    formData,
    statusCode: response.statusCode,
    responseBody: response.body,
  };
};
