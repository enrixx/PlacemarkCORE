import axios from "axios";
import { serviceUrl } from "../fixtures.js";

export const placecoreService = {
  placecoreUrl: serviceUrl,

  // User methods
  async createUser(user) {
    const res = await axios.post(`${this.placecoreUrl}/api/users`, user);
    return res.data;
  },

  async getUser(id) {
    const res = await axios.get(`${this.placecoreUrl}/api/users/${id}`);
    return res.data;
  },

  async getAllUsers() {
    const res = await axios.get(`${this.placecoreUrl}/api/users`);
    return res.data;
  },

  async deleteAllUsers() {
    const res = await axios.delete(`${this.placecoreUrl}/api/users`);
    return res.data;
  },

  // Admin method
  async createAdmin(user) {
    const res = await axios.post(`${this.placecoreUrl}/api/users/admin`, user);
    return res.data;
  },

  // Placemark methods
  async createPlacemark(placemark) {
    const res = await axios.post(`${this.placecoreUrl}/api/placemarks`, placemark);
    return res.data;
  },

  async getPlacemark(id) {
    const res = await axios.get(`${this.placecoreUrl}/api/placemarks/${id}`);
    return res.data;
  },

  async getAllPlacemarks() {
    const res = await axios.get(`${this.placecoreUrl}/api/placemarks`);
    return res.data;
  },

  async updatePlacemark(id, placemark) {
    const res = await axios.put(`${this.placecoreUrl}/api/placemarks/${id}`, placemark);
    return res.data;
  },

  async deleteAllPlacemarks() {
    const res = await axios.delete(`${this.placecoreUrl}/api/placemarks`);
    return res.data;
  },

  async deletePlacemark(id) {
    const res = await axios.delete(`${this.placecoreUrl}/api/placemarks/${id}`);
    return res.data;
  },

  async getPlacemarksByUser(userId) {
    const res = await axios.get(`${this.placecoreUrl}/api/users/${userId}/placemarks`);
    return res.data;
  },

  async getPlacemarksByCategory(categoryId) {
    const res = await axios.get(`${this.placecoreUrl}/api/categories/${categoryId}/placemarks`);
    return res.data;
  },

  // Category methods
  async createCategory(category) {
    const res = await axios.post(`${this.placecoreUrl}/api/categories`, category);
    return res.data;
  },

  async getCategory(id) {
    const res = await axios.get(`${this.placecoreUrl}/api/categories/${id}`);
    return res.data;
  },

  async getAllCategories() {
    const res = await axios.get(`${this.placecoreUrl}/api/categories`);
    return res.data;
  },

  async updateCategory(id, category) {
    const res = await axios.put(`${this.placecoreUrl}/api/categories/${id}`, category);
    return res.data;
  },

  async deleteAllCategories() {
    const res = await axios.delete(`${this.placecoreUrl}/api/categories`);
    return res.data;
  },

  async deleteCategory(id) {
    const res = await axios.delete(`${this.placecoreUrl}/api/categories/${id}`);
    return res.data;
  },

  // Auth methods
  async authenticate(user) {
    const response = await axios.post(`${this.placecoreUrl}/api/users/authenticate`, user);
    axios.defaults.headers.common["Authorization"] = "Bearer " + response.data.token;
    return response.data;
  },

  async clearAuth() {
    axios.defaults.headers.common["Authorization"] = "";
  },
};
