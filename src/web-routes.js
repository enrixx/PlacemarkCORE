import { accountController } from "./controllers/account-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { placemarkController } from "./controllers/placemark-controller.js";
import { adminMiddleware } from "./utils/admin-middleware.js";
import { adminController } from "./controllers/admin-controller.js";
import { categoryController } from "./controllers/category-controller.js";

export const webRoutes = [
  { method: "GET", path: "/", config: accountController.index },
  { method: "GET", path: "/signup", config: accountController.showSignup },
  { method: "GET", path: "/login", config: accountController.showLogin },
  { method: "GET", path: "/logout", config: accountController.logout },
  { method: "POST", path: "/register", config: accountController.signup },
  { method: "POST", path: "/authenticate", config: accountController.login },

  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "GET", path: "/dashboard/addplacemarkpage", config: dashboardController.addPlacemarkPage },
  { method: "POST", path: "/dashboard/addplacemark", config: dashboardController.addPlacemark },
  { method: "GET", path: "/dashboard/deleteplacemark/{id}", config: dashboardController.deletePlacemark },

  { method: "GET", path: "/placemark/{id}", config: placemarkController.index },
  { method: "GET", path: "/placemark/edit/{id}", config: placemarkController.showEditPage },
  { method: "POST", path: "/placemark/update/{id}", config: placemarkController.update },
  { method: "POST", path: "/placemark/{id}/uploadimage", config: placemarkController.uploadImage },
  { method: "GET", path: "/placemark/{id}/deleteimage", config: placemarkController.deleteImage },

  { method: "GET", path: "/categories", handler: categoryController.list.handler },

  {
    method: "GET",
    path: "/admin",
    config: { pre: [{ method: adminMiddleware.requireAdmin }], handler: adminController.index.handler },
  },
  {
    method: "GET",
    path: "/admin/users",
    config: { pre: [{ method: adminMiddleware.requireAdmin }], handler: adminController.usersList.handler },
  },
  {
    method: "GET",
    path: "/admin/users/new",
    config: { pre: [{ method: adminMiddleware.requireAdmin }], handler: adminController.showCreateUser.handler },
  },
  {
    method: "POST",
    path: "/admin/users",
    config: { pre: [{ method: adminMiddleware.requireAdmin }], ...adminController.createUser },
  },
  {
    method: "GET",
    path: "/admin/users/{id}/edit",
    config: { pre: [{ method: adminMiddleware.requireAdmin }], handler: adminController.showEditUser.handler },
  },
  {
    method: "POST",
    path: "/admin/users/{id}",
    config: { pre: [{ method: adminMiddleware.requireAdmin }], handler: adminController.updateUser.handler },
  },
  {
    method: "GET",
    path: "/admin/users/{id}/delete",
    config: { pre: [{ method: adminMiddleware.requireAdmin }], handler: adminController.deleteUser.handler },
  },

  {
    method: "GET",
    path: "/admin/placemarks",
    config: { pre: [{ method: adminMiddleware.requireAdmin }], handler: adminController.placemarksList.handler },
  },
  {
    method: "GET",
    path: "/admin/placemark/{id}/delete",
    config: { pre: [{ method: adminMiddleware.requireAdmin }], handler: adminController.deletePlacemark.handler },
  },
];
