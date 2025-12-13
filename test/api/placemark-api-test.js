import { assert } from "chai";
import { placecoreService } from "./placemark-service.js";
import { maggie, maggieCredentials, testCategories, testPlacemarks, adminCredentials } from "../fixtures.js";
import { assertSubset } from "../test-utils.js";

suite("Placemark API tests", () => {
  let user = null;
  let category = null;
  setup(async () => {
    await placecoreService.clearAuth();
    await placecoreService.authenticate(adminCredentials);
    await placecoreService.deleteAllCategories();
    await placecoreService.deleteAllPlacemarks();
    await placecoreService.deleteAllUsers();
    user = await placecoreService.createUser(maggie);
    await placecoreService.authenticate(maggieCredentials);
    category = await placecoreService.createCategory(testCategories[0]);
  });

  test("create a placemark", async () => {
    const placemark = { ...testPlacemarks[0], categoryName: category.name };
    const returnedPlacemark = await placecoreService.createPlacemark(placemark);
    assertSubset(placemark, returnedPlacemark);
  });

  test("create multiple placemarks", async () => {
    for (let i = 0; i < testPlacemarks.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const placemark = { ...testPlacemarks[i], categoryName: category.name };
      // eslint-disable-next-line no-await-in-loop
      await placecoreService.createPlacemark(placemark);
    }
    const returnedPlacemarks = await placecoreService.getAllPlacemarks();
    assert.equal(returnedPlacemarks.length, testPlacemarks.length);
    for (let i = 0; i < returnedPlacemarks.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const placemark = await placecoreService.getPlacemark(returnedPlacemarks[i]._id);
      // eslint-disable-next-line no-await-in-loop
      assertSubset(testPlacemarks[i], placemark);
    }
  });

  test("delete a placemark - fail no admin", async () => {
    const placemark = { ...testPlacemarks[0], categoryName: category.name };
    const returnedPlacemark = await placecoreService.createPlacemark(placemark);
    try {
      await placecoreService.deleteAllPlacemarks();
      assert.fail("Forbidden delete should have failed");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
    const placemark2 = await placecoreService.getPlacemark(returnedPlacemark._id);
    assert.deepEqual(placemark2, returnedPlacemark);
  });

  test("delete all placemarks - fail no admin", async () => {
    for (let i = 0; i < testPlacemarks.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const placemark = { ...testPlacemarks[i], categoryName: category.name };
      // eslint-disable-next-line no-await-in-loop
      await placecoreService.createPlacemark(placemark);
    }
    try {
      await placecoreService.deleteAllPlacemarks();
      assert.fail("Forbidden delete should have failed");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  suiteTeardown(async () => {
    await placecoreService.clearAuth();
    await placecoreService.authenticate(adminCredentials);
    await placecoreService.deleteAllCategories();
    await placecoreService.deleteAllPlacemarks();
    await placecoreService.deleteAllUsers();
  });
});
