import Joi from "joi";

export const UserSpecForSignup = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const UserSpec = UserSpecForSignup.keys({
  role: Joi.string().valid("user", "admin").default("user"),
}).label("UserSpec");

export const UserCredentialsSpec = {
  email: Joi.string().email().required(),
  password: Joi.string().required(),
};

export const PlacemarkSpec = {
  name: Joi.string().required(),
  categoryName: Joi.string().required(),
  description: Joi.string(),
  longitude: Joi.number().required(),
  latitude: Joi.number().required(),
};
