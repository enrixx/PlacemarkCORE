import dotenv from "dotenv";

dotenv.config();

export const serviceUrl = process.env.SERVICE_URL;

export const adminCredentials = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
};
export const maggie = {
  firstName: "Maggie",
  lastName: "Simpson",
  email: "maggie@simpson.com",
  password: "secret",
};

export const maggieCredentials = {
  email: "maggie@simpson.com",
  password: "secret",
};

export const testUsers = [
  {
    firstName: "Homer",
    lastName: "Simpson",
    email: "homer@simpson.com",
    password: "secret",
  },
  {
    firstName: "Marge",
    lastName: "Simpson",
    email: "marge@simpson.com",
    password: "secret",
  },
  {
    firstName: "Bart",
    lastName: "Simpson",
    email: "bart@simpson.com",
    password: "secret",
  },
];

export const testCategories = [
  { name: "Restaurant" },
  { name: "Museum" },
  { name: "Shopping" },
  { name: "Park" },
  { name: "Beach" },
  { name: "Hotel" },
  { name: "Cinema" },
  { name: "Gym" },
  { name: "Library" },
  { name: "Theater" },
  { name: "Stadium" },
  { name: "Gas Station" },
  { name: "Other" },
];

export const categorySightseeing = {
  name: "Sightseeing",
};

export const eiffelTower = {
  name: "Eiffel Tower",
  categoryName: "Sightseeing",
  description: "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France.",
  longitude: 2.2946,
  latitude: 48.8584,
};

export const testPlacemarks = [
  {
    name: "Test Placemark 1",
    categoryName: "Test Category",
    longitude: 12.456,
    latitude: 78.012,
  },
  {
    name: "Test Placemark 2",
    categoryName: "Test Category",
    longitude: 45.789,
    latitude: 12.012,
  },
  {
    name: "Test Placemark 3",
    categoryName: "Test Category",
    longitude: 78.456,
    latitude: 45.789,
  },
];
