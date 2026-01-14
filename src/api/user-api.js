import Boom from "@hapi/boom";
import Joi from "joi";
import crypto from "crypto";
import { db } from "../models/db.js";
import { IdSpec, JwtAuth, UserArray, UserCredentialsSpec, UserOAuthSpec, UserSpec, UserSpecForAdminCreate, UserSpecPlus } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { createToken } from "./jwt-utils.js";
import { comparePassword } from "../utils/password-utils.js";
import { sendEmail } from "../utils/email-service.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const userApi = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        return await db.userStore.getAllUsers();
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all users",
    notes: "Returns details of all users",
    response: { schema: UserArray, failAction: validationError },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        return user;
      } catch (err) {
        return Boom.serverUnavailable("No User with this id");
      }
    },
    tags: ["api"],
    description: "Get a specific user",
    notes: "Returns user details",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  create: {
    auth: false,
    handler: async function (request, h) {
      try {
        const existingUser = await db.userStore.getUserByEmail(request.payload.email);
        if (existingUser) {
          return Boom.badRequest("Email already registered");
        }
        const user = await db.userStore.addUser(request.payload);
        if (user) {
          return h.response(user).code(201);
        }
        return Boom.badImplementation("Error creating user");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a User",
    notes: "Returns the newly created user",
    validate: { payload: UserSpec, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
      scope: "admin",
    },
    handler: async function (request, h) {
      try {
        await db.userStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all users",
    notes: "All users removed from Placemark",
  },

  createAdmin: {
    auth: {
      strategy: "jwt",
      scope: "admin",
    },
    handler: async function (request, h) {
      try {
        const existingUser = await db.userStore.getUserByEmail(request.payload.email);
        if (existingUser) {
          return Boom.badRequest("Email already registered");
        }
        const user = await db.userStore.addUser(request.payload);
        if (user) {
          return h.response(user).code(201);
        }
        return Boom.badImplementation("Error creating user");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api", "admin"],
    description: "Create a User (Admin Only)",
    notes: "Allows an admin to create a new user, optionally as an admin",
    validate: { payload: UserSpecForAdminCreate, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  authenticate: {
    auth: false,
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserByEmail(request.payload.email);
        if (!user) {
          // Same error message for invalid email or password to prevent user enumeration
          return Boom.unauthorized("Email or password incorrect");
        }
        const passwordsMatch = await comparePassword(request.payload.password, user.password);
        if (!passwordsMatch) {
          return Boom.unauthorized("Email or password incorrect");
        }
        const token = createToken(user);
        return h.response({ success: true, token: token }).code(201);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Authenticate a User",
    notes: "If user has valid email/password, create and return a JWT token",
    validate: { payload: UserCredentialsSpec, failAction: validationError },
    response: { schema: JwtAuth, failAction: validationError },
  },

  authenticateOAuth: {
    auth: false,
    handler: async function (request, h) {
      try {
        let user = await db.userStore.getUserByEmail(request.payload.email);
        if (!user) {
          const userData = {
            firstName: request.payload.firstName,
            lastName: request.payload.lastName,
            email: request.payload.email,
            password: crypto.randomBytes(16).toString("hex"),
            role: "user",
            isOAuth: true,
          };
          user = await db.userStore.addUser(userData);
        }
        const token = createToken(user);
        return h.response({ success: true, token: token }).code(201);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Authenticate a User via OAuth",
    notes: "If user exists, return token. If not, create and return token.",
    validate: { payload: UserOAuthSpec, failAction: validationError },
    response: { schema: JwtAuth, failAction: validationError },
  },

  update: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const userId = request.params.id;
        const loggedInUserId = request.auth.credentials.id.toString();

        // Users can only update their own profile unless they're admin
        if (userId !== loggedInUserId && request.auth.credentials.scope !== "admin") {
          return Boom.forbidden("You can only update your own profile");
        }

        const user = await db.userStore.getUserById(userId);
        if (!user) {
          return Boom.notFound("User not found");
        }

        // Check if email is being changed and if it's already taken by another user
        if (request.payload.email && request.payload.email !== user.email) {
          const existingUser = await db.userStore.getUserByEmail(request.payload.email);
          if (existingUser && existingUser._id !== userId) {
            return Boom.badRequest("Email already in use");
          }
        }

        // Preserve role - only allow role changes if admin is updating another user
        const updates = { ...request.payload };
        if (!updates.role) {
          updates.role = user.role;
        }

        // If this is an OAuth user changing password, clear the OAuth flag
        if (updates.password && user.isOAuth) {
          updates.isOAuth = false;
        }

        await db.userStore.updateUser(userId, updates);
        return await db.userStore.getUserById(userId);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Update a User",
    notes: "Updates user profile information",
    validate: {
      params: { id: IdSpec },
      payload: Joi.object({
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        email: Joi.string().email().optional(),
        password: Joi.string().optional(),
      }),
      failAction: validationError,
    },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  forgotPassword: {
    auth: false,
    handler: async function (request, h) {
      try {
        const { email } = request.payload;
        const user = await db.userStore.getUserByEmail(email);
        if (!user) {
          return { message: "If that email address is in our database, we will send you an email to reset your password." };
        }

        const token = crypto.randomBytes(20).toString("hex");
        const expiration = Date.now() + 3600000;

        await db.userStore.updateUser(user._id, {
          passwordResetToken: token,
          passwordResetExpires: expiration,
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

        const text =
          `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `${resetUrl}\n\n` +
          `This link will expire in 1 hour.\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`;

        const templatePath = path.resolve(__dirname, "../views/email/email.html");
        let html = "";

        try {
            html = fs.readFileSync(templatePath, "utf8");
            html = html.replace(/{{resetUrl}}/g, resetUrl);
            html = html.replace(/{{firstName}}/g, user.firstName);
        } catch (fileErr) {
            console.error("Error reading email template at:", templatePath, fileErr);
            html = `
              <p>Please reset your password by clicking this link: <a href="${resetUrl}">${resetUrl}</a></p>
            `;
        }

        try {
          await sendEmail(user.email, "Password Reset - Placemark", text, html);
        } catch (emailErr) {
            console.error("Failed to send reset email:", emailErr);
            return Boom.serverUnavailable("Email service is currently unavailable. Please try again later.");
        }

        return { message: "If that email address is in our database, we will send you an email to reset your password." };
      } catch (err) {
        console.error("Forgot Password Error:", err);
        return Boom.serverUnavailable("Error processing request");
      }
    },
    tags: ["api"],
    description: "Request Password Reset",
    notes: "Sends password reset email",
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required(),
      }),
      failAction: validationError,
    },
  },

  resetPassword: {
    auth: false,
    handler: async function (request, h) {
      try {
        const { token, password } = request.payload;
        const user = await db.userStore.getUserByResetToken(token);

        if (!user) {
          return Boom.badRequest("Password reset token is invalid or has expired.");
        }

        await db.userStore.updateUser(user._id, {
          password: password,
          passwordResetToken: null, // Clear token
          passwordResetExpires: null,
        });

        return { message: "Password has been reset." };
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Reset Password",
    notes: "Resets password using a valid token",
    validate: {
      payload: Joi.object({
        token: Joi.string().required(),
        password: Joi.string().required(),
      }),
      failAction: validationError,
    },
  },
};
