import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from "../models/db.js";

dotenv.config();

export function createToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    scope: user.role,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
  };
  const secret = process.env.COOKIE_PASSWORD || process.env.cookie_password;
  if (!secret) {
    throw new Error("JWT secret not configured");
  }
  return jwt.sign(payload, secret, options);
}

export function decodeToken(token) {
  const userInfo = {};
  try {
    const decoded = jwt.verify(token, process.env.COOKIE_PASSWORD);
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
    userInfo.scope = decoded.scope;
  } catch (e) {
    console.log(e.message);
  }
  return userInfo;
}

export async function validate(decoded, request) {
  const user = await db.userStore.getUserById(decoded.id);
  if (!user) {
    return { isValid: false };
  }
  const credentials = {
    id: user._id,
    scope: user.role,
  };
  return { isValid: true, credentials };
}
