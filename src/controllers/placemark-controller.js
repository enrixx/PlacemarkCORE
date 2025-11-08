import { db } from "../models/db.js";

export const placemarkController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
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
};

