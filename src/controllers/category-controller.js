import { db } from "../models/db.js";

export const categoryController = {
  list: {
    handler: async function (request, h) {
      const query = request.query.search || "";
      const store = db.categoryStore;
      if (!store) {
        return h.response([]).code(200);
      }
      const categories = query ? await store.searchCategories(query) : await store.getAllCategories();
      return h.response(categories).code(200);
    },
  },
};
