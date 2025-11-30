import { db } from "../models/db.js";
import { PlacemarkSpec } from "../models/joi-schemas.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const categoryId = request.query.categoryId || "";
      let allPlacemarks;
      if (categoryId) {
        allPlacemarks = await db.placemarkStore.getPlacemarksByCategoryId(categoryId);
      } else {
        allPlacemarks = await db.placemarkStore.getAllPlacemarks();
      }
      const categoriesRaw = await db.categoryStore.getAllCategories();

      const categories = (categoriesRaw || []).map((c) => ({ ...c, selected: c._id.toString() === categoryId }));
      const idToName = new Map((categoriesRaw || []).map((c) => [c._id.toString(), c.name || ""]));
      const placemarks = await Promise.all(
        allPlacemarks.map(async (p) => {
          const user = await db.userStore.getUserById(p.userid);
          return {
            ...p,
            categoryName: p.categoryId ? idToName.get(p.categoryId.toString()) || "" : "",
            isOwner: p.userid.toString() === loggedInUser._id.toString(),
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
      const categoryNameRaw = request.payload.categoryName;
      const categoryName = categoryNameRaw.charAt(0).toUpperCase() + categoryNameRaw.slice(1).toLowerCase();
      let category = await db.categoryStore.getCategoryByName(categoryName);
      if (!category) {
        category = await db.categoryStore.addCategory({ name: categoryName });
      }
      const newPlacemark = {
        name: request.payload.name,
        categoryId: category._id,
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
