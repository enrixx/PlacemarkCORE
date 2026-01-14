import Handlebars from "handlebars";

export const handlebarsHelpers = {
  register() {
    Handlebars.registerHelper("isOwner", (placemarkUser, loggedInUser) => {
      // Convert to strings to handle MongoDB ObjectId comparison
      const userStr = placemarkUser?.toString() || placemarkUser;
      const loggedStr = loggedInUser?.toString() || loggedInUser;
      return userStr === loggedStr;
    });
    Handlebars.registerHelper("ifEq", (a, b, options) => (a === b ? options.fn(this) : options.inverse(this)));
    Handlebars.registerHelper("ifEquals", (a, b, options) => (a === b ? options.fn(this) : options.inverse(this)));
    Handlebars.registerHelper("eq", (a, b) => {
      // Convert to strings to handle MongoDB ObjectId comparison
      const aStr = a?.toString() || a;
      const bStr = b?.toString() || b;
      return aStr === bStr;
    });
    Handlebars.registerHelper("or", (a, b) => a || b);
  },
};
