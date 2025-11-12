import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";

export const placemarkController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);

      if (placemark.imgPublicId) {
        placemark.img = imageStore.getSignedUrl(placemark.imgPublicId);
      } else if (placemark.img) {
        const extractedPublicId = imageStore.extractPublicId(placemark.img);
        if (extractedPublicId) {
          placemark.img = imageStore.getSignedUrl(extractedPublicId);
          placemark.imgPublicId = extractedPublicId;
          await db.placemarkStore.updatePlacemark(placemark._id, placemark.userid, placemark);
        }
      }

      const viewData = {
        title: "Placemark",
        placemark: placemark,
        user: loggedInUser,
      };
      return h.view("placemark-view", viewData);
    },
  },

  showEditPage: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      if (placemark.userid !== loggedInUser._id) {
        return h.redirect("/dashboard");
      }
      const viewData = {
        title: "Edit Placemark",
        placemark: placemark,
      };
      return h.view("edit-placemark-view", viewData);
    },
  },

  update: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      const newPlacemark = {
        name: request.payload.name,
        category: request.payload.category,
        description: request.payload.description,
        longitude: Number(request.payload.longitude),
        latitude: Number(request.payload.latitude),
      };
      await db.placemarkStore.updatePlacemark(placemark._id, loggedInUser._id, newPlacemark);
      return h.redirect(`/placemark/${placemark._id}`);
    },
  },

  uploadImage: {
    handler: async function (request, h) {
      try {
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        const file = request.payload.imagefile;

        if (file && file.length > 0) {
          const imageData = await imageStore.uploadImage(file);
          placemark.img = imageData.url;
          placemark.imgPublicId = imageData.publicId;
          await db.placemarkStore.updatePlacemark(placemark._id, request.auth.credentials._id, placemark);
        } else {
          throw new Error("No image file provided");
        }
        return h.redirect(`/placemark/${placemark._id}`);
      } catch (err) {
        console.error("Upload error:", err);
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
        return h.redirect(`/placemark/${placemark._id}`);
      }
    },
    payload: {
      multipart: true,
      output: "data",
      maxBytes: 209715200,
      parse: true,
    },
  },
};

