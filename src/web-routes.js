import path from "path";
import { fileURLToPath } from "url";
import { accountsController } from "./controllers/accounts-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { placemarkController } from "./controllers/placemark-controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const webRoutes = [
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "POST", path: "/register", config: accountsController.signup },
  { method: "POST", path: "/authenticate", config: accountsController.login },

  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "GET", path: "/dashboard/addplacemarkpage", config: dashboardController.addPlacemarkPage },
  { method: "POST", path: "/dashboard/addplacemark", config: dashboardController.addPlacemark },
  { method: "GET", path: "/dashboard/deleteplacemark/{id}", config: dashboardController.deletePlacemark },

  { method: "GET", path: "/placemark/{id}", config: placemarkController.index },
  { method: "GET", path: "/placemark/edit/{id}", config: placemarkController.showEditPage },
  { method: "POST", path: "/placemark/update/{id}", config: placemarkController.update },
  { method: "POST", path: "/placemark/{id}/uploadimage", config: placemarkController.uploadImage },

  {
    method: "GET",
    path: "/js/ui-utils.js",
    handler: {
      file: {
        path: path.join(__dirname, "utils/ui-utils.js"),
      },
    },
    options: { auth: false },
  },
];
