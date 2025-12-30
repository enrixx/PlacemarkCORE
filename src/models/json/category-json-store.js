import {v4} from "uuid";
import {db} from "./store-utils.js";

export const categoryJsonStore = {
    async addCategory(category) {
        await db.read();
        category._id = v4();
        db.data.categories.push(category);
        await db.write();
        return category;
    },

    async getAllCategories() {
        await db.read();
        return db.data.categories;
    },

    async getCategoryById(id) {
        await db.read();
        return (db.data?.categories || []).find((c) => c._id === id) || null;
    },

    async getCategoryByName(name) {
        await db.read();
        return db.data.categories.find((category) => category.name.toLowerCase() === name.toLowerCase());
    },

    async searchCategories(query) {
        if (!query) return [];
        await db.read();
        const q = query.trim().toLowerCase();
        return (db.data?.categories || []).filter((c) => (c.name || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q));
    },

    async deleteCategoryById(id) {
        await db.read();
        const index = db.data.categories.findIndex((categories) => categories._id === id);
        if (index === -1) {
            return false;
        }
        db.data.categories.splice(index, 1);
        await db.write();
        return true;
    },

    async deleteAllCategories() {
        db.data.categories = [];
        await db.write();
    },
};
