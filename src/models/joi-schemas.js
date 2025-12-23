import Joi from "joi";

export const IdSpec = Joi.alternatives().try(Joi.string(), Joi.object()).description("a valid ID");

export const UserCredentialsSpec = Joi.object({
    email: Joi.string().email().example("homer@simpson.com").required(),
    password: Joi.string().example("secret").required(),
}).label("UserCredentials");

export const UserSpec = UserCredentialsSpec.keys({
    firstName: Joi.string().example("Homer").required(),
    lastName: Joi.string().example("Simpson").required(),
}).label("UserDetails");

export const UserSpecForAdminCreate = UserSpec.keys({
    role: Joi.string().valid("user", "admin").default("user"),
}).label("UserSpecForAdminCreate");

export const UserSpecPlus = UserSpec.keys({
    role: Joi.string().valid("user", "admin").required(),
    _id: IdSpec,
    __v: Joi.number(),
}).label("UserDetailsPlus");

export const UserArray = Joi.array().items(UserSpecPlus).label("UserArray");

export const ImageSpec = Joi.object({
    url: Joi.string().required(),
    publicId: Joi.string().required(),
    uploaderId: IdSpec,
}).label("ImageSpec");

export const PlacemarkSpec = Joi.object({
    name: Joi.string().required(),
    categoryName: Joi.string().optional(),
    description: Joi.string().optional(),
    latitude: Joi.number().min(-90).max(90).required().messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90'
    }),
    longitude: Joi.number().min(-180).max(180).required().messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180'
    }),
    images: Joi.array().items(ImageSpec).optional(),
}).label("PlacemarkSpec");

export const PlacemarkSpecCreate = PlacemarkSpec.keys({
    categoryName: Joi.string().required(),
}).label("PlacemarkSpecCreate");

export const PlacemarkSpecPlus = PlacemarkSpec.keys({
    categoryId: IdSpec,
    userid: IdSpec,
    _id: IdSpec,
    __v: Joi.number(),
}).label("PlacemarkDetailsPlus");

export const PlacemarkArray = Joi.array().items(PlacemarkSpecPlus).label("PlacemarkArray");

export const CategorySpec = Joi.object({
    name: Joi.string().required().example("Landmarks"),
}).label("CategorySpec");

export const CategorySpecPlus = CategorySpec.keys({
    _id: IdSpec,
    __v: Joi.number(),
}).label("CategoryDetailsPlus");

export const CategoryArray = Joi.array().items(CategorySpecPlus).label("CategoryArray");

export const JwtAuth = Joi.object()
    .keys({
        success: Joi.boolean().example("true").required(),
        token: Joi.string().example("eyJhbGciOiJND.g5YmJisIjoiaGYwNTNjAOhE.gCWGmY5-YigQw0DCBo").required(),
    })
    .label("JwtAuth");
