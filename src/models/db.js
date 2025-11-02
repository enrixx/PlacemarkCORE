import { userMemStore } from "./mem/user-mem-store.js";
import { placemarkMemStore } from "./mem/placemark-mem-store.js";

export const db = {
  userStore: null,
  placemarkStore: null,

  init() {
    this.userStore = userMemStore;
    this.placemarkStore = placemarkMemStore;
  },
};
