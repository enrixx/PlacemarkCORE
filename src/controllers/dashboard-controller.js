import { db } from "../models/db.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const placemarks = await db.placemarkStore.getAllPlacemarks();
      const viewData = {
        title: "PlacemarkCore Dashboard",
        placemarks: placemarks,
      };
      return h.view("dashboard-view", viewData);
    },
  },

  addPlacemark: {
    handler: async function (request, h) {
      const newPlacemark = {
        name: request.payload.name,
        longitude: request.payload.longitude,
        latitude: request.payload.latitude,
      };
      await db.placemarkStore.addPlacemark(newPlacemark);
      return h.redirect("/dashboard");
    },
  },
};
