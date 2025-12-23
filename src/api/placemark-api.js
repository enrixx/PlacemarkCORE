import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { IdSpec, PlacemarkArray, PlacemarkSpec, PlacemarkSpecCreate, PlacemarkSpecPlus } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { weatherService } from "../utils/weather-service.js";
import { placemarkUtils } from "../utils/placemark-utils.js";
import { imageStore } from "../models/image-store.js";

export const placemarkApi = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const placemarks = await db.placemarkStore.getAllPlacemarks();
        return await placemarkUtils.enrichPlacemarks(placemarks);
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
        return await placemarkUtils.enrichPlacemark(placemark);
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
          const enrichedPlacemark = await placemarkUtils.enrichPlacemark(placemark);
          return h.response(enrichedPlacemark).code(201);
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

        // Only update allowed fields - preserve images array
        const updateData = {
          name: request.payload.name,
          description: request.payload.description,
          latitude: request.payload.latitude,
          longitude: request.payload.longitude,
          categoryId: request.payload.categoryId,
          images: placemark.images // Preserve existing images
        };

        const updatedPlacemark = await db.placemarkStore.updatePlacemark(request.params.id, updateData);
        if (updatedPlacemark) {
          const enrichedPlacemark = await placemarkUtils.enrichPlacemark(await db.placemarkStore.getPlacemarkById(request.params.id));
          return h.response(enrichedPlacemark).code(200);
        }
        return Boom.badImplementation("error updating placemark");
      } catch (err) {
        console.error("Error updating placemark:", err);
        return Boom.badRequest(err.message || "Error updating placemark");
      }
    },
    tags: ["api"],
    description: "Update a placemark",
    notes: "Returns the updated placemark. Only the owner or admin can update.",
    validate: { params: { id: IdSpec }, payload: PlacemarkSpec, failAction: validationError },
    response: { schema: PlacemarkSpecPlus, failAction: validationError },
  },

  uploadImage: {
    auth: {
      strategy: "jwt",
    },
    payload: {
      multipart: true,
      output: "data",
      maxBytes: 209715200,
      parse: true,
    },
    handler: async function (request, h) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (!placemark) {
          return Boom.notFound("No Placemark with this id");
        }

        const file = request.payload.imagefile;
        if (Object.keys(file).length > 0) {
          const result = await imageStore.uploadImage(request.payload.imagefile);
          const newImage = {
            url: result.url,
            publicId: result.publicId,
            uploaderId: request.auth.credentials._id
          };

          // Initialize images array if it doesn't exist
          if (!placemark.images) {
            placemark.images = [];
          }
          placemark.images.push(newImage);

          await db.placemarkStore.updatePlacemark(placemark._id, placemark);
          const enrichedPlacemark = await placemarkUtils.enrichPlacemark(placemark);
          return h.response(enrichedPlacemark).code(201);
        }
        return Boom.badRequest("No image file provided");
      } catch (err) {
        console.log(err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Upload an image to a placemark",
    notes: "Returns the updated placemark",
    validate: { params: { id: IdSpec }, failAction: validationError },
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
        await db.placemarkStore.deletePlacemarkById(request.params.id);
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

  deleteImage: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        if (!placemark) {
          return Boom.notFound("No Placemark with this id");
        }

        const imageId = request.params.imageId;
        // Find the image in the array. Since we don't have IDs for images in the array (unless Mongoose adds them automatically, which it does for subdocuments),
        // we might need to identify by publicId or use the subdocument _id.
        // Mongoose subdocuments have _id by default.

        const image = placemark.images.id(imageId);
        if (!image) {
             return Boom.notFound("No image with this id in the placemark");
        }

        const userId = request.auth.credentials._id;
        const isAdmin = request.auth.credentials.scope === "admin";
        const isOwner = image.uploaderId.toString() === userId;

        if (!isOwner && !isAdmin) {
          return Boom.forbidden("You do not have permission to delete this image");
        }

        await imageStore.deleteImage(image.publicId);
        placemark.images.pull({ _id: imageId });
        await db.placemarkStore.updatePlacemark(placemark._id, placemark);

        const enrichedPlacemark = await placemarkUtils.enrichPlacemark(placemark);
        return h.response(enrichedPlacemark).code(200);
      } catch (err) {
        console.log(err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete an image from a placemark",
    notes: "Returns the updated placemark",
    validate: { params: { id: IdSpec, imageId: IdSpec }, failAction: validationError },
    response: { schema: PlacemarkSpecPlus, failAction: validationError },
  },

  findByUser: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const placemarks = await db.placemarkStore.getPlacemarksByUserId(request.params.id);
        return await placemarkUtils.enrichPlacemarks(placemarks);
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
        const placemarks = await db.placemarkStore.getPlacemarksByCategoryId(request.params.id);
        return await placemarkUtils.enrichPlacemarks(placemarks);
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
