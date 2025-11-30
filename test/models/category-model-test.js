import { assert } from "chai";
import dotenv from "dotenv";
import { db } from "../../src/models/db.js";
import { testCategories, categorySightseeing } from "../fixtures.js";

dotenv.config();

suite("Category Model tests", () => {
  const storeType = process.env.DB_TYPE || "mem";
  console.log(`Running tests with ${storeType} store`);

  setup(async () => {
    await db.init(storeType);
    await db.userStore.deleteAll();
    await db.placemarkStore.deleteAllPlacemarks();
    await db.categoryStore.deleteAllCategories();
    for (let i = 0; i < testCategories.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testCategories[i] = await db.categoryStore.addCategory(testCategories[i]);
    }
  });

  test("create a category", async () => {
    const newCategory = await db.categoryStore.addCategory(categorySightseeing);
    assert.equal(newCategory.name, categorySightseeing.name);
  });

  test("get a category - success", async () => {
    const retrievedCategory = await db.categoryStore.getCategoryById(testCategories[0]._id);
    assert.deepEqual(retrievedCategory, testCategories[0]);
  });

  test("get a category by name - case insensitive", async () => {
    const retrievedCategory = await db.categoryStore.getCategoryByName(testCategories[0].name.toUpperCase());
    assert.deepEqual(retrievedCategory, testCategories[0]);
    const retrievedCategoryLower = await db.categoryStore.getCategoryByName(testCategories[0].name.toLowerCase());
    assert.deepEqual(retrievedCategoryLower, testCategories[0]);
  });

  test("get a category - bad params", async () => {
    assert.isNull(await db.categoryStore.getCategoryById(""));
    assert.isNull(await db.categoryStore.getCategoryById());
  });

  test("delete a category", async () => {
    const allCategories = await db.categoryStore.getAllCategories();
    const allCategoriesLenght = allCategories.length;
    assert.equal(allCategoriesLenght, 13);
    await db.categoryStore.deleteCategoryById(testCategories[0]._id);
    const newAllCategories = await db.categoryStore.getAllCategories();
    assert.equal(newAllCategories.length, allCategoriesLenght - 1);
  });

  test("delete all categories", async () => {
    let allCategories = await db.categoryStore.getAllCategories();
    assert.equal(allCategories.length, 13);
    await db.categoryStore.deleteAllCategories();
    allCategories = await db.categoryStore.getAllCategories();
    assert.equal(allCategories.length, 0);
  });

  suiteTeardown(async () => {
    await db.init(storeType);
    await db.categoryStore.deleteAllCategories();
  });
});
