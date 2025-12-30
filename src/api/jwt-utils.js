import jwt from "jsonwebtoken";
import { db } from "../models/db.js";

export function createToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
  const options = {
    algorithm: "HS256",
    expiresIn: "1h",
  };
  const secret = process.env.COOKIE_PASSWORD;
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
    userInfo.role = decoded.role;
  } catch (e) {
    console.log(e.message);
  }
  return userInfo;
}

export async function validate(decoded) {
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
