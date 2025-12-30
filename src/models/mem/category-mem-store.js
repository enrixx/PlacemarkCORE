import {v4} from "uuid";

let categories = [{_id: v4(), name: "General"}];

export const categoryMemStore = {
    async addCategory(category) {
        category._id = v4();
        categories.push(category);
        return category;
    },

    async getAllCategories() {
        return categories;
    },

    async getCategoryById(id) {
        return categories.find((c) => c._id === id) || null;
    },

    async getCategoryByName(name) {
        return categories.find((category) => category.name.toLowerCase() === name.toLowerCase());
    },

    async searchCategories(query) {
        if (!query) return [];
        const q = query.trim().toLowerCase();
        return categories.filter((c) => (c.name || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q));
    },

    async deleteCategoryById(id) {
        const index = categories.findIndex((c) => c._id === id);
        if (index === -1) {
            return false;
        }
        categories.splice(index, 1);
        return true;
    },

    async deleteAllCategories() {
        categories = [];
    },
};
