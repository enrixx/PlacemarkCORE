import Handlebars from "handlebars";

export const handlebarsHelpers = {
  register() {
    Handlebars.registerHelper("isOwner", (placemarkUser, loggedInUser) => placemarkUser === loggedInUser);
    Handlebars.registerHelper("ifEq", (a, b, options) => (a === b) ? options.fn(this) : options.inverse(this));
    Handlebars.registerHelper("ifEquals", (a, b, options) => (a === b) ? options.fn(this) : options.inverse(this));
  },
};
