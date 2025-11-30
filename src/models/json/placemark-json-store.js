import { v4 } from "uuid";
import { db } from "./store-utils.js";

function normalizeImages(obj) {
  if (!obj.img || obj.img.length === 0) {
    obj.img = null;
  }
  if (!obj.imgPublicId || obj.imgPublicId.length === 0) {
    obj.imgPublicId = null;
  }
}

export const placemarkJsonStore = {
  async getAllPlacemarks() {
    await db.read();
    return db.data.placemarks;
  },

  async addPlacemark(userid, placemark) {
    await db.read();
    placemark._id = v4();
    placemark.userid = userid;
    normalizeImages(placemark);
    db.data.placemarks.push(placemark);
    await db.write();
    return placemark;
  },

  async getPlacemarkById(id) {
    await db.read();
    let list = db.data.placemarks.find((placemark) => placemark._id === id);
    if (list === undefined) list = null;
    return list;
  },

  async getPlacemarksByUserId(userid) {
    await db.read();
    return db.data.placemarks.filter((placemark) => placemark.userid === userid);
  },

  async deletePlacemarkById(id, userId) {
    await db.read();
    const index = db.data.placemarks.findIndex((placemark) => placemark._id === id && placemark.userid === userId);
    if (index === -1) {
      return false;
    }
    db.data.placemarks.splice(index, 1);
    await db.write();
    return true;
  },

  async deleteAnyPlacemark(placemarkId) {
    await db.read();
    const index = db.data.placemarks.findIndex((placemark) => placemark._id === placemarkId);
    if (index === -1) {
      return false;
    }
    db.data.placemarks.splice(index, 1);
    await db.write();
    return true;
  },

  async deleteAllPlacemarks() {
    db.data.placemarks = [];
    await db.write();
  },

  async updatePlacemark(placemarkId, userId, updatedPlacemark) {
    await db.read();
    const placemark = db.data.placemarks.find((p) => p._id === placemarkId && p.userid === userId);
    if (!placemark) return false;
    normalizeImages(updatedPlacemark);
    if (placemark) {
      placemark.name = updatedPlacemark.name;
      placemark.categoryId = updatedPlacemark.categoryId;
      placemark.description = updatedPlacemark.description;
      placemark.latitude = updatedPlacemark.latitude;
      placemark.longitude = updatedPlacemark.longitude;
      placemark.img = updatedPlacemark.img;
      placemark.imgPublicId = updatedPlacemark.imgPublicId;
      await db.write();
    }
    return true;
  },

  async getPlacemarksByCategoryId(categoryId) {
    if (!categoryId) return [];
    await db.read();
    const placemarks = db.data?.placemarks || [];
    return placemarks.filter((p) => (p.categoryId || "") === categoryId);
  },
};
