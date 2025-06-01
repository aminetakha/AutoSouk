import request from "supertest";
import { app } from "../app";

export const signupUser = async (
  userType: "buyer" | "seller" | "mechanic" | "admin" = "buyer"
) => {
  const formData = {
    firstName: "John",
    lastName: "Doe",
    email: "user@example.com",
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
