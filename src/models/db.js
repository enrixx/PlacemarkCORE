import { userMemStore } from "./mem/user-mem-store.js";
import { placemarkMemStore } from "./mem/placemark-mem-store.js";
import { userJsonStore } from "./json/user-json-store.js";
import { placemarkJsonStore } from "./json/placemark-json-store.js";
import { seedAdmin } from "./seed-admin.js";
import { categoryJsonStore } from "./json/category-json-store.js";
import { categoryMemStore } from "./mem/category-mem-store.js";
import { userMongoStore } from "./mongo/user-mongo-store.js";
import { placemarkMongoStore } from "./mongo/placemark-mongo-store.js";
import { categoryMongoStore } from "./mongo/category-mongo-store.js";
import { connectMongo } from "./mongo/connect.js";

export const db = {
  userStore: null,
  placemarkStore: null,
  categoryStore: null,

  async init(storeType) {
    switch (storeType) {
      case "mem":
        this.userStore = userMemStore;
        this.placemarkStore = placemarkMemStore;
        this.categoryStore = categoryMemStore;
        await seedAdmin("mem");
        break;
      case "json":
        this.userStore = userJsonStore;
        this.placemarkStore = placemarkJsonStore;
        this.categoryStore = categoryJsonStore;
        await seedAdmin("json");
        break;
      case "mongo":
        this.userStore = userMongoStore;
        this.placemarkStore = placemarkMongoStore;
        this.categoryStore = categoryMongoStore;
        connectMongo();
        await seedAdmin("mongo");
        break;
      default:
        this.userStore = userMemStore;
        this.placemarkStore = placemarkMemStore;
        this.categoryStore = categoryMemStore;
    }
  },
};
