import { db } from "../models/db.js";
import { PlacemarkSpec } from "../models/joi-schemas.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const allPlacemarks = await db.placemarkStore.getAllPlacemarks();
      const placemarks = await Promise.all(allPlacemarks.map(async (p) => {
        const user = await db.userStore.getUserById(p.userid);
        return {
          ...p,
          isOwner: p.userid === loggedInUser._id,
          userEmail: user.email,
        };
      }));
      const viewData = {
        title: "PlacemarkCore Dashboard",
        user: loggedInUser,
        placemarks: placemarks,
      };
      return h.view("dashboard-view", viewData);
    },
  },

  addPlacemark: {
    validate: {
      payload: PlacemarkSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("dashboard-view", { title: "Add Placemark error", errors: error.details }).takeover().code(400);
      },
    },
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
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      const loggedInUser = request.auth.credentials;
      if (placemark && placemark.userid === loggedInUser._id) {
        await db.placemarkStore.deletePlacemarkById(placemark._id);
      }
      return h.redirect("/dashboard");
    },
  },

};

