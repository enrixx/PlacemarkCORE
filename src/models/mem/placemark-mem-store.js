import { v4 } from "uuid";

let placemarks = [];


export const placemarkMemStore = {
  async getAllPlacemarks() {
    return placemarks;
  },

  async addPlacemark(userid, placemark) {
    placemark._id = v4();
    placemark.userid = userid;

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

  async updatePlacemark(placemarkId, updatedPlacemark) {
    const placemark = placemarks.find((p) => p._id === placemarkId);
    if (!placemark) return false;

    placemark.name = updatedPlacemark.name;
    placemark.categoryId = updatedPlacemark.categoryId;
    placemark.description = updatedPlacemark.description;
    placemark.latitude = updatedPlacemark.latitude;
    placemark.longitude = updatedPlacemark.longitude;

    // Handle images array - generate IDs for new images
    if (updatedPlacemark.images) {
      placemark.images = updatedPlacemark.images.map(img => {
        if (!img._id) {
          return { ...img, _id: v4() };
        }
        return img;
      });
    } else {
      placemark.images = placemark.images || [];
    }

    return true;
  },

  async getPlacemarksByCategoryId(categoryId) {
    if (!categoryId) return [];
    return placemarks.filter((p) => (p.categoryId || "") === categoryId);
  },
};
