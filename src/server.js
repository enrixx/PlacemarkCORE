import dotenv from "dotenv";
import Hapi from "@hapi/hapi";
import Vision from "@hapi/vision";
import Handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import Cookie from "@hapi/cookie";
import Joi from "joi";
import Inert from "@hapi/inert";
import jwt from "hapi-auth-jwt2";
import HapiSwagger from "hapi-swagger";
import { webRoutes } from "./web-routes.js";
import { apiRoutes } from "./api-routes.js";
import { db } from "./models/db.js";
import { accountController } from "./controllers/account-controller.js";
import { handlebarsHelpers } from "./utils/helpers.js";
import { validate } from "./api/jwt-utils.js";

dotenv.config();
const swaggerOptions = {
  info: {
    title: "PlacemarkCORE API",
    version: "0.1",
  },
  securityDefinitions: {
    jwt: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  security: [{ jwt: [] }],
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
    routes: {
      cors: true,
    },
  });
  await server.register([
    Cookie,
    Inert,
    Vision,
    jwt,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);
  server.validator(Joi);
  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.COOKIE_NAME,
      password: process.env.COOKIE_PASSWORD,
      isSecure: false,
    },
    redirectTo: "/",
    validate: accountController.validate,
  });
  server.auth.strategy("jwt", "jwt", {
    key: process.env.COOKIE_PASSWORD,
    validate: validate,
    verifyOptions: { algorithms: ["HS256"] },
  });
  server.auth.default("session");
  server.views({
    engines: {
      hbs: Handlebars,
    },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });
  handlebarsHelpers.register();
  await db.init(process.env.DB_TYPE);
  server.route(webRoutes);
  server.route(apiRoutes);
  await server.start();
  console.log("Server running on %s", server.info.uri);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
