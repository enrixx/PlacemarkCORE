import { v4 } from "uuid";
import { db } from "./store-utils.js";

export const categoryJsonStore = {
  async getAllCategories() {
    await db.read();
    return db.data.categories;
  },

  async getCategoryById(id) {
    await db.read();
    return (db.data?.categories || []).find((c) => c._id === id) || null;
  },

  async searchCategories(query) {
    if (!query) return [];
    await db.read();
    const q = query.trim().toLowerCase();
    return (db.data?.categories || []).filter((c) => (c.name || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q));
  },
};
