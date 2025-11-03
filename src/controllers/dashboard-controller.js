import { db } from "../models/db.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemarks = await db.placemarkStore.getUserPlacemarks(loggedInUser._id);
      const viewData = {
        title: "PlacemarkCore Dashboard",
        user: loggedInUser,
        placemarks: placemarks,
      };
      return h.view("dashboard-view", viewData);
    },
  },

  addPlacemark: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const newPlacemark = {
        userid: loggedInUser._id,
        name: request.payload.name,
        longitude: request.payload.longitude,
        latitude: request.payload.latitude,
      };
      await db.placemarkStore.addPlacemark(newPlacemark);
      return h.redirect("/dashboard");
    },
  },

  deletePlacemark: {
    handler: async function (request, h) {
      const playlist = await db.placemarkStore.getPlacemarkById(request.params.id);
      await db.placemarkStore.deletePlacemarkById(playlist._id);
      return h.redirect("/dashboard");
    },
  },

};
