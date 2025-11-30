import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";

export const placemarkController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      const categories = await db.categoryStore.getAllCategories();
      const idToName = new Map((categories || []).map((c) => [c._id.toString(), c.name || ""]));

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

      placemark.categoryName = idToName.get(placemark.categoryId.toString()) || "";
      const viewData = {
        title: "Placemark",
        placemark: placemark,
        user: loggedInUser,
        categories: categories,
        isOwner: placemark.userid.toString() === loggedInUser._id.toString(),
      };
      return h.view("placemark-view", viewData);
    },
  },

  showEditPage: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      if (placemark.userid.toString() !== loggedInUser._id.toString()) {
        return h.redirect("/dashboard");
      }
      const categoriesRaw = await db.categoryStore.getAllCategories();
      const categories = (categoriesRaw || []).map((c) => ({ ...c, selected: c._id.toString() === placemark.categoryId.toString() }));
      const idToName = new Map((categoriesRaw || []).map((c) => [c._id.toString(), c.name || ""]));
      placemark.categoryName = idToName.get(placemark.categoryId.toString()) || "";
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

      if (placemark.userid.toString() !== loggedInUser._id.toString()) {
        return h.redirect("/dashboard");
      }

      const categoryNameRaw = request.payload.categoryName;
      const categoryName = categoryNameRaw.charAt(0).toUpperCase() + categoryNameRaw.slice(1).toLowerCase();

      let category = await db.categoryStore.getCategoryByName(categoryName);
      if (!category) {
        category = await db.categoryStore.addCategory({ name: categoryName });
      }

      const newPlacemark = {
        name: request.payload.name,
        categoryId: category._id,
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
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);

      try {
        if (placemark.userid.toString() !== loggedInUser._id.toString()) {
          return h.redirect("/dashboard");
        }
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
        const categories = await db.categoryStore.getAllCategories();

        return h.view("placemark-view", {
          title: "Upload Error",
          placemark: placemark,
          categories: categories,
          user: loggedInUser,
          errors: [{ message: err.message }],
        });
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

        if (placemark.userid.toString() !== loggedInUser._id.toString()) {
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
