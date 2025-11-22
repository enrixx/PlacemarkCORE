import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";

export const placemarkController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      const categories = await db.categoryStore.getAllCategories();
      const idToName = new Map((categories || []).map((c) => [c._id, c.name || ""]));

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

      placemark.categoryName = idToName.get(placemark.categoryId) || "";
      const viewData = {
        title: "Placemark",
        placemark: placemark,
        user: loggedInUser,
        categories: categories,
      };
      return h.view("placemark-view", viewData);
    },
  },

  showEditPage: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      const categoriesRaw = await db.categoryStore.getAllCategories();
      const categories = (categoriesRaw || []).map((c) => ({ ...c, selected: c._id === placemark.categoryId }));
      const idToName = new Map((categories || []).map((c) => [c._id, c.name || ""]));
      placemark.categoryName = idToName.get(placemark.categoryId) || "";
      if (placemark.userid !== loggedInUser._id) {
        return h.redirect("/dashboard");
      }
      const viewData = {
        title: "Edit Placemark",
        placemark: placemark,
        categories: categories,
      };
      return h.view("edit-placemark-view", viewData);
    },
  },

  update: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);

      const categoryId = request.payload.category;

      const newPlacemark = {
        name: request.payload.name,
        categoryId: categoryId,
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

  deleteImage: {
    handler: async function (request, h) {
      try {
        const loggedInUser = request.auth.credentials;
        const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);

        if (placemark.userid !== loggedInUser._id) {
          return h.redirect("/dashboard");
        }

        if (placemark.imgPublicId) {
          await imageStore.deleteImage(placemark.imgPublicId);
        }

        placemark.img = null;
        placemark.imgPublicId = null;
        await db.placemarkStore.updatePlacemark(placemark._id, loggedInUser._id, placemark);

        return h.redirect(`/placemark/${placemark._id}`);
      } catch (err) {
        console.error("Error deleting image:", err);
        return h.redirect("/dashboard");
      }
    },
  },
};
