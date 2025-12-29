import { assert } from "chai";
import { placecoreService } from "./placemark-service.js";
import { adminCredentials, maggie, maggieCredentials, testCategories } from "../fixtures.js";

suite("Category API tests", () => {
  let user = null;
  setup(async () => {
    await placecoreService.clearAuth();
    await placecoreService.authenticate(adminCredentials);
    await placecoreService.deleteAllCategories();
    await placecoreService.deleteAllUsers();
    user = await placecoreService.createUser(maggie);
    await placecoreService.authenticate(maggieCredentials);
  });

  test("create a category", async () => {
    const newCategory = await placecoreService.createCategory(testCategories[0]);
    assert.isNotNull(newCategory);
    assert.isDefined(newCategory._id);
  });

  test("get a category", async () => {
    const category = await placecoreService.createCategory(testCategories[0]);
    const returnedCategory = await placecoreService.getCategory(category._id);
    assert.deepEqual(category, returnedCategory);
  });

  test("get all categories", async () => {
    for (let i = 0; i < testCategories.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await placecoreService.createCategory(testCategories[i]);
    }
    const allCategories = await placecoreService.getAllCategories();
    assert.equal(allCategories.length, testCategories.length);
  });

  test("delete a category - fail no admin", async () => {
    const category = await placecoreService.createCategory(testCategories[0]);
    try {
      await placecoreService.deleteCategory(category._id);
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  test("delete all categories - fail no admin", async () => {
    for (let i = 0; i < testCategories.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await placecoreService.createCategory(testCategories[i]);
    }
    try {
      await placecoreService.deleteAllCategories();
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  suiteTeardown(async () => {
    await placecoreService.authenticate(adminCredentials);
    await placecoreService.deleteAllCategories();
    await placecoreService.deleteAllUsers();
  });
});
