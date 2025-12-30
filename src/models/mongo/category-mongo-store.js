import {Category} from "./category.js";

export const categoryMongoStore = {
    async getAllCategories() {
        return Category.find().lean();
    },

    async getCategoryById(id) {
        if (id) {
            return Category.findOne({_id: id}).lean();
        }
        return null;
    },

    async addCategory(category) {
        const newCategory = new Category(category);
        const categoryObj = await newCategory.save();
        return this.getCategoryById(categoryObj._id);
    },

    async getCategoryByName(name) {
        return Category.findOne({
            name: {$regex: `^${name}$`, $options: "i"},
        }).lean();
    },

    async deleteCategoryById(id) {
        try {
            await Category.deleteOne({_id: id});
            return true;
        } catch (error) {
            return false;
        }
    },

    async deleteAllCategories() {
        await Category.deleteMany({});
    },
};
