import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";
import { UserSpec } from "../models/joi-schemas.js";

export const adminController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const users = await db.userStore.getAllUsers();
      const placemarks = await db.placemarkStore.getAllPlacemarks();
      const viewData = {
        title: "Admin Dashboard",
        user: loggedInUser,
        userCount: users.length,
        placemarkCount: placemarks.length,
      };
      return h.view("admin-view", viewData);
    },
  },

  usersList: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const users = await db.userStore.getAllUsers();
      return h.view("admin-users-view", { title: "Manage Users", user: loggedInUser, users: users });
    },
  },

  showCreateUser: {
    handler: function (request, h) {
      const loggedInUser = request.auth.credentials;
      return h.view("admin-user-edit-view", { title: "Create User", user: loggedInUser });
    },
  },

  createUser: {
    validate: {
      payload: UserSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        const loggedInUser = request.auth.credentials;
        return h
          .view("admin-user-edit-view", {
            title: "Create user error",
            user: loggedInUser,
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      const user = request.payload;
      await db.userStore.addUser(user);
      return h.redirect("/admin/users");
    },
  },

  showEditUser: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const userToEdit = await db.userStore.getUserById(request.params.id);
      if (!userToEdit) {
        return h.redirect("/admin/users");
      }
      return h.view("admin-user-edit-view", { title: "Edit User", user: loggedInUser, editUser: userToEdit });
    },
  },

  updateUser: {
    handler: async function (request, h) {
      const { _id: loggedInUserId } = request.auth.credentials;
      const { id } = request.params;
      const { payload } = request;

      // Prevent self-demotion: if logged-in is editing their own account, disallow removing admin role
      if (loggedInUserId === id && payload.role && payload.role !== "admin") {
        const editUser = await db.userStore.getUserById(id);
        return h
          .view("admin-user-edit-view", {
            title: "Edit User",
            user: request.auth.credentials,
            editUser: editUser,
            errors: [{ message: "You cannot remove your own admin role." }],
          })
          .takeover();
      }

      if (payload.password === "" || payload.password === undefined) {
        delete payload.password;
      }

      await db.userStore.updateUser(id, payload);
      return h.redirect("/admin/users");
    },
  },

  deleteUser: {
    handler: async function (request, h) {
      const { _id: loggedInUserId } = request.auth.credentials;
      const { id } = request.params;
      // Prevent deleting self
      if (loggedInUserId === id) {
        const users = await db.userStore.getAllUsers();
        return h
          .view("admin-users-view", {
            title: "Manage Users",
            user: request.auth.credentials,
            users: users,
            errors: [{ message: "You cannot delete your own account." }],
          })
          .takeover();
      }
      // Prevent deleting last admin
      const adminCount = await (db.userStore.getAdminCount ? db.userStore.getAdminCount() : Promise.resolve(0));
      const userToDelete = await db.userStore.getUserById(id);
      if (userToDelete && userToDelete.role === "admin" && adminCount <= 1) {
        const users = await db.userStore.getAllUsers();
        return h
          .view("admin-users-view", {
            title: "Manage Users",
            user: request.auth.credentials,
            users: users,
            errors: [{ message: "Cannot delete the last admin." }],
          })
          .takeover();
      }

      await db.userStore.deleteUserById(id);
      return h.redirect("/admin/users");
    },
  },

  placemarksList: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const allPlacemarks = await db.placemarkStore.getAllPlacemarks();
      const placemarks = await Promise.all(
        allPlacemarks.map(async (p) => {
          const user = await db.userStore.getUserById(p.userid);
          return {
            ...p,
            userEmail: user ? user.email : "Unknown User",
          };
        })
      );
      return h.view("admin-placemarks-view", {
        title: "Manage Placemarks",
        user: loggedInUser,
        placemarks: placemarks,
      });
    },
  },

  deletePlacemark: {
    handler: async function (request, h) {
      const { id } = request.params;

      await db.placemarkStore.deleteAnyPlacemark(id);

      return h.redirect("/admin/placemarks");
    },
  },
};
