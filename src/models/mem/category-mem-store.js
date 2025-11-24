import { v4 } from "uuid";

let categories = [
  { _id: v4(), name: "General", description: "General topics" }
];

export const categoryMemStore = {
  async getAllCategories() {
    return categories;
  },

  async addCategory(category) {
    const newCat = { _id: v4(), name: category.name, description: category.description || "" };
    categories.push(newCat);
    return newCat;
  },

  async getCategoryById(id) {
    return categories.find(c => c._id === id) || null;
  },

  async getCategoryByName(name) {
    if (!name) return null;
    const norm = name.trim().toLowerCase();
    return categories.find(c => (c.name || "").toLowerCase() === norm) || null;
  },

  async searchCategories(query) {
    if (!query) return [];
    const q = query.trim().toLowerCase();
    return categories.filter(c =>
      (c.name || "").toLowerCase().includes(q) ||
      (c.description || "").toLowerCase().includes(q)
    );
  },

  async deleteAllCategories() {
    categories = [];
  }
};