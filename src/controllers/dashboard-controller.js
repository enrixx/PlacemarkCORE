import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";
import { PlacemarkSpec } from "../models/joi-schemas.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const categoryId = request.query.category || "";
      const store = db.placemarkStore;
      const allPlacemarks = store.getPlacemarksByCategory && categoryId ? await store.getPlacemarksByCategory(categoryId) : await store.getAllPlacemarks();
      const categoriesRaw = await db.categoryStore.getAllCategories();

      const categories = (categoriesRaw || []).map((c) => ({ ...c, selected: c._id === categoryId }));
      const idToName = new Map((categories || []).map((c) => [c._id, c.name || ""]));
      const placemarks = await Promise.all(
        allPlacemarks.map(async (p) => {
          if (p.imgPublicId) {
            p.img = imageStore.getSignedUrl(p.imgPublicId);
          } else if (p.img) {
            const extractedPublicId = imageStore.extractPublicId(p.img);
            if (extractedPublicId) {
              p.img = imageStore.getSignedUrl(extractedPublicId);
              p.imgPublicId = extractedPublicId;
              db.placemarkStore.updatePlacemark(p._id, p.userid, p).catch((err) => console.error("Error updating placemark:", err));
            }
          }

          const user = await db.userStore.getUserById(p.userid);
          return {
            ...p,
            categoryName: idToName.get(p.categoryId) || "",
            isOwner: p.userid === loggedInUser._id,
            userEmail: user ? user.email : "Unknown User",
          };
        })
      );
      const viewData = {
        title: "PlacemarkCore Dashboard",
        user: loggedInUser,
        placemarks: placemarks,
        categories: categories,
      };
      return h.view("dashboard-view", viewData);
    },
  },
  addPlacemarkPage: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const categoriesRaw = await db.categoryStore.getAllCategories();
      const categories = (categoriesRaw || []).map((c) => ({ ...c, selected: false }));
      const viewData = {
        title: "Add a new Placemark",
        user: loggedInUser,
        categories: categories,
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
        const categoriesRaw = await db.categoryStore.getAllCategories();
        const categories = (categoriesRaw || []).map((c) => ({ ...c, selected: false }));
        return h
          .view("add-placemark-view", {
            title: "Add Placemark error",
            user: loggedInUser,
            placemarks: placemarks,
            categories: categories,
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
        categoryId: request.payload.category,
        description: request.payload.description || request.payload.name,
        longitude: Number(request.payload.longitude),
        latitude: Number(request.payload.latitude),
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
