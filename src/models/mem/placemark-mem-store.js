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
    return p
  },

  async deletePlacemarkById(id, userId) {
    const index = placemarks.findIndex((placemark) => placemark._id === id && placemark.userid === userId);
    if (index === -1) {
      return false;
    }
    placemarks.splice(index, 1);
    return true;
  },

  async deleteAllPlacemarks() {
    placemarks = [];
  },

  async getUserPlacemarks(userid) {
    return placemarks.filter((placemark) => placemark.userid === userid);
  },

};
