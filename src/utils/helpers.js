import Handlebars from "handlebars";

export const handlebarsHelpers = {
  register() {
    Handlebars.registerHelper("isOwner", (placemarkUser, loggedInUser) => {
      return placemarkUser === loggedInUser;
    });
  },
};

