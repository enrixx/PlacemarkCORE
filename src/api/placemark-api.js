import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { IdSpec, PlacemarkArray, PlacemarkSpec, PlacemarkSpecCreate, PlacemarkSpecPlus } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { weatherService } from "../utils/weather-service.js";

export const placemarkApi = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        return await db.placemarkStore.getAllPlacemarks();
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    response: { schema: PlacemarkArray, failAction: validationError },
    description: "Get all placemarks",
    notes: "Returns all placemarks",
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    async handler(request) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (!placemark) {
          return Boom.notFound("No placemark with this id");
        }
        return placemark;
      } catch (err) {
        return Boom.serverUnavailable("No placemark with this id");
      }
    },
    tags: ["api"],
    description: "Find a Placemark",
    notes: "Returns a placemark",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: PlacemarkSpecPlus, failAction: validationError },
  },

  create: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const categoryNameRaw = request.payload.categoryName;
        const categoryName = categoryNameRaw.charAt(0).toUpperCase() + categoryNameRaw.slice(1).toLowerCase();
        let category = await db.categoryStore.getCategoryByName(categoryName);
        if (!category) {
          category = await db.categoryStore.addCategory({ name: categoryName });
        }
        const placemark = await db.placemarkStore.addPlacemark(request.auth.credentials._id, { ...request.payload, categoryId: category._id });
        if (placemark) {
          return h.response(placemark).code(201);
        }
        return Boom.badImplementation("error creating placemark");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a placemark",
    notes: "Returns the newly created placemark",
    validate: { payload: PlacemarkSpecCreate, failAction: validationError },
    response: { schema: PlacemarkSpecPlus, failAction: validationError },
  },

  update: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (!placemark) {
          return Boom.notFound("No Placemark with this id");
        }
        if (request.auth.credentials._id !== placemark.userid && request.auth.credentials.scope !== "admin") {
          return Boom.forbidden("You do not have permission to edit this placemark");
        }
        const updatedPlacemark = await db.placemarkStore.updatePlacemark(request.params.id, request.payload);
        if (updatedPlacemark) {
          return h.response(updatedPlacemark).code(200);
        }
        return Boom.badImplementation("error updating placemark");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Update a placemark",
    notes: "Updates a specific placemark. Requires user ownership or admin rights.",
    validate: {
      params: { id: IdSpec },
      payload: PlacemarkSpec,
      failAction: validationError,
    },
    response: { schema: PlacemarkSpecPlus, failAction: validationError },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
      scope: "admin",
    },
    handler: async function (request, h) {
      try {
        await db.placemarkStore.deleteAllPlacemarks();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all placemarks (Admin)",
    notes: "Deletes all placemarks (requires admin scope)",
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (!placemark) {
          return Boom.notFound("No Placemark with this id");
        }
        if (request.auth.credentials._id !== placemark.userid && request.auth.credentials.scope !== "admin") {
          return Boom.forbidden("You do not have permission to delete this placemark");
        }
        await db.placemarkStore.deletePlacemark(request.params.id);
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete a placemark",
    notes: "Deletes a specific placemark. Requires user ownership or admin rights.",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },

  findByUser: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        return await db.placemarkStore.getPlacemarksByUserId(request.params.id);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get placemarks by user",
    notes: "Returns all placemarks created by a specific user",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: PlacemarkArray, failAction: validationError },
  },

  findByCategory: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        return await db.placemarkStore.getPlacemarksByCategoryId(request.params.id);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get placemarks by category",
    notes: "Returns all placemarks within a specific category",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: PlacemarkArray, failAction: validationError },
  },
  getWeather: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (!placemark) {
          return Boom.notFound("No placemark with this id");
        }
        return await weatherService.getWeather(placemark.latitude, placemark.longitude);
      } catch (err) {
        return Boom.serverUnavailable("Error fetching weather data");
      }
    },
    tags: ["api"],
    description: "Get weather for a placemark",
    notes: "Returns weather data",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },
};
