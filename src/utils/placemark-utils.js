import { db } from "../models/db.js";

export const placemarkUtils = {
  async enrichPlacemark(placemark) {
    if (!placemark) return null;
    const category = await db.categoryStore.getCategoryById(placemark.categoryId);
    return {
      ...placemark,
      categoryName: category ? category.name : "",
    };
  },

  async enrichPlacemarks(placemarks) {
    const categories = await db.categoryStore.getAllCategories();
    const idToName = new Map((categories || []).map((c) => [c._id.toString(), c.name || ""]));

    return placemarks.map((p) => ({
      ...p,
      categoryName: p.categoryId ? idToName.get(p.categoryId.toString()) || "" : "",
    }));
  },

  async getCategoriesWithSelection(selectedId) {
    const categoriesRaw = await db.categoryStore.getAllCategories();
    return (categoriesRaw || []).map((c) => ({ ...c, selected: c._id.toString() === selectedId?.toString() }));
  },

  async enrichPlacemarksWithUser(placemarks, loggedInUser) {
    if (!placemarks) return [];

    return Promise.all(
      placemarks.map(async (p) => {
        const user = await db.userStore.getUserById(p.userid);
        return {
          ...p,
          isOwner: p.userid.toString() === loggedInUser._id.toString(),
          userEmail: user ? user.email : "Unknown User",
        };
      })
    );
  },
};
