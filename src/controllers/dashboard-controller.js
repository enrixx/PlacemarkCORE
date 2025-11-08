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
          userEmail: user ? user.email : "Unknown User",
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
  addPlacemarkPage: {
    handler: function (request, h) {
      const loggedInUser = request.auth.credentials;
      const viewData = {
        title: "Add a new Placemark",
        user: loggedInUser,
      };
      return h.view("add-placemark-view", viewData);
    },
  },
  addPlacemark: {
    validate: {
      payload: PlacemarkSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const loggedInUser = request.auth.credentials;
        const allPlacemarks = await db.placemarkStore.getAllPlacemarks();
        const placemarks = await Promise.all(
          allPlacemarks.map(async (p) => {
            const user = await db.userStore.getUserById(p.userid);
            return {
              ...p,
              isOwner: p.userid === loggedInUser._id,
              userEmail: user ? user.email : "Unknown User",
            };
          })
        );
        return h
          .view("add-placemark-view", {
            title: "Add Placemark error",
            user: loggedInUser,
            placemarks: placemarks,
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const newPlacemark = {
        name: request.payload.name,
        category: request.payload.category,
        description: request.payload.name,
        longitude: request.payload.longitude,
        latitude: request.payload.latitude,
      };
      await db.placemarkStore.addPlacemark(loggedInUser._id, newPlacemark);
      return h.redirect("/dashboard");
    },
  },

  deletePlacemark: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const success = await db.placemarkStore.deletePlacemarkById(request.params.id, loggedInUser._id);
      if (!success) {
        const allPlacemarks = await db.placemarkStore.getAllPlacemarks();
        const placemarks = await Promise.all(
          allPlacemarks.map(async (p) => {
            const user = await db.userStore.getUserById(p.userid);
            return {
              ...p,
              isOwner: p.userid === loggedInUser._id,
              userEmail: user ? user.email : "Unknown User",
            };
          })
        );
        const viewData = {
          title: "PlacemarkCore Dashboard",
          user: loggedInUser,
          placemarks: placemarks,
          errors: [{ message: "You can only delete your own placemarks." }],
        };
        return h.view("dashboard-view", viewData).takeover();
      }
      return h.redirect("/dashboard");
    },
  },

};

