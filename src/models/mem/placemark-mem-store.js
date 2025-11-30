import { v4 } from "uuid";

let placemarks = [];

function normalizeImages(obj) {
  if (!obj.img || obj.img.length === 0) {
    obj.img = null;
  }
  if (!obj.imgPublicId || obj.imgPublicId.length === 0) {
    obj.imgPublicId = null;
  }
}

export const placemarkMemStore = {
  async getAllPlacemarks() {
    return placemarks;
  },

  async addPlacemark(userid, placemark) {
    placemark._id = v4();
    placemark.userid = userid;
    normalizeImages(placemark);
    placemarks.push(placemark);
    return placemark;
  },

  async getPlacemarkById(id) {
    let p = placemarks.find((placemark) => placemark._id === id);
    if (p === undefined) p = null;
    return p;
  },

  async deletePlacemarkById(id, userId) {
    const index = placemarks.findIndex((placemark) => placemark._id === id && placemark.userid === userId);
    if (index === -1) {
      return false;
    }
    placemarks.splice(index, 1);
    return true;
  },

  async deleteAnyPlacemark(id) {
    const index = placemarks.findIndex((placemark) => placemark._id === id);
    if (index === -1) {
      return false;
    }
    placemarks.splice(index, 1);
    return true;
  },

  async deleteAllPlacemarks() {
    placemarks = [];
  },

  async getPlacemarksByUserId(userid) {
    return placemarks.filter((placemark) => placemark.userid === userid);
  },

  async updatePlacemark(placemarkId, userId, updatedPlacemark) {
    const placemark = placemarks.find((p) => p._id === placemarkId && p.userid === userId);
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
    }
    return true;
  },

  async getPlacemarksByCategoryId(categoryId) {
    if (!categoryId) return [];
    return placemarks.filter((p) => (p.categoryId || "") === categoryId);
  },
};
