import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";
import { placemarkUtils } from "../utils/placemark-utils.js";

export const placemarkController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      let placemark = await db.placemarkStore.getPlacemarkById(request.params.id);

      // Use utility to enrich the placemark with categoryName
      placemark = await placemarkUtils.enrichPlacemark(placemark);
      const categories = await db.categoryStore.getAllCategories();

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
      let placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      if (placemark.userid.toString() !== loggedInUser._id.toString()) {
        return h.redirect("/dashboard");
      }

      // Use utility to get categories with the 'selected' flag pre-calculated
      const categories = await placemarkUtils.getCategoriesWithSelection(placemark.categoryId);
      placemark = await placemarkUtils.enrichPlacemark(placemark);

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
        images: placemark.images, // Preserve images
      };

      await db.placemarkStore.updatePlacemark(placemark._id, newPlacemark);
      return h.redirect(`/placemark/${placemark._id}`);
    },
  },

  uploadImage: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);

      try {
        // Allow everyone to upload images
        const file = request.payload.imagefile;
        if (file && file.length > 0) {
          const imageData = await imageStore.uploadImage(file);
          const newImage = {
            url: imageData.url,
            publicId: imageData.publicId,
            uploaderId: loggedInUser._id
          };

          if (!placemark.images) {
            placemark.images = [];
          }
          placemark.images.push(newImage);

          const updateData = {
            name: placemark.name,
            categoryId: placemark.categoryId,
            description: placemark.description,
            latitude: placemark.latitude,
            longitude: placemark.longitude,
            images: placemark.images
          };
          await db.placemarkStore.updatePlacemark(placemark._id, updateData);
        } else {
          throw new Error("No image file provided");
        }

        return h.redirect(`/placemark/${placemark._id}`);
      } catch (err) {
        const enrichedPlacemark = await placemarkUtils.enrichPlacemark(placemark);
        const categories = await db.categoryStore.getAllCategories();

        return h.view("placemark-view", {
          title: "Upload Error",
          placemark: enrichedPlacemark,
          categories: categories,
          user: loggedInUser,
          isOwner: placemark.userid.toString() === loggedInUser._id.toString(),
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
      const loggedInUser = request.auth.credentials;
      const placemark = await db.placemarkStore.getPlacemarkById(request.params.id);
      const imageId = request.query.imageId;

      const returnError = async (errorMessage) => {
        const enrichedPlacemark = await placemarkUtils.enrichPlacemark(placemark);
        const categories = await db.categoryStore.getAllCategories();
        return h.view("placemark-view", {
          title: "Placemark",
          placemark: enrichedPlacemark,
          user: loggedInUser,
          categories: categories,
          isOwner: placemark.userid.toString() === loggedInUser._id.toString(),
          errors: [{ message: errorMessage }],
        });
      };

      try {
        if (!placemark.images || placemark.images.length === 0) {
          return returnError("No images found in this placemark.");
        }

        const image = placemark.images.find(img => img._id && img._id.toString() === imageId);

        if (!image) {
          return returnError("Image not found.");
        }

        const isOwner = image.uploaderId.toString() === loggedInUser._id.toString();
        const isAdmin = loggedInUser.scope === "admin";

        if (!isOwner && !isAdmin) {
          return returnError("You do not have permission to delete this image.");
        }

        await imageStore.deleteImage(image.publicId);

        placemark.images = placemark.images.filter(img => img._id.toString() !== imageId);

        const updateData = {
          name: placemark.name,
          categoryId: placemark.categoryId,
          description: placemark.description,
          latitude: placemark.latitude,
          longitude: placemark.longitude,
          images: placemark.images
        };
        await db.placemarkStore.updatePlacemark(placemark._id, updateData);

        return h.redirect(`/placemark/${placemark._id}`);
      } catch (err) {
        console.error("Error deleting image:", err);
        return returnError(`Error deleting image: ${err.message}`);
      }
    },
  },
};
