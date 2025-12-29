import Boom from "@hapi/boom";
import Joi from "joi";
import { db } from "../models/db.js";
import { IdSpec, JwtAuth, UserArray, UserCredentialsSpec, UserSpec, UserSpecForAdminCreate, UserSpecPlus } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { createToken } from "./jwt-utils.js";
import { comparePassword } from "../utils/password-utils.js";

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
        return Boom.badImplementation("error creating user");
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
        return Boom.badImplementation("error creating user");
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
          return Boom.unauthorized("User not found");
        }
        const passwordsMatch = await comparePassword(request.payload.password, user.password);
        if (!passwordsMatch) {
          return Boom.unauthorized("Invalid password");
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

  update: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const userId = request.params.id;
        const loggedInUserId = request.auth.credentials.id;

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

        await db.userStore.updateUser(userId, request.payload);
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
      failAction: validationError
    },
    response: { schema: UserSpecPlus, failAction: validationError },
  },
};
