import { assert } from "chai";
import dotenv from "dotenv";
import { db } from "../../src/models/db.js";
import { categorySightseeing, eiffelTower, testCategories, testPlacemarks, testUsers } from "../fixtures.js";

dotenv.config();

suite("Placemark Model tests", () => {
  let user = null;
  let category = null;
  const storeType = process.env.DB_TYPE || "mem";
  console.log(`Running tests with ${storeType} store`);

  setup(async () => {
    await db.init(storeType);
    await db.placemarkStore.deleteAllPlacemarks();
    await db.userStore.deleteAll();
    await db.categoryStore.deleteAllCategories();
    user = await db.userStore.addUser(testUsers[0]);
    category = await db.categoryStore.addCategory(testCategories[0]);
    for (let i = 0; i < testPlacemarks.length; i += 1) {
      testPlacemarks[i].categoryId = category._id;
      // eslint-disable-next-line no-await-in-loop
      testPlacemarks[i] = await db.placemarkStore.addPlacemark(user._id, testPlacemarks[i]);
    }
  });

  test("create a placemark", async () => {
    const newPlacemark = await db.placemarkStore.addPlacemark(user._id, eiffelTower);
    assert.isDefined(newPlacemark._id);
  });

  test("delete all placemarks", async () => {
    let returnedPlacemarks = await db.placemarkStore.getAllPlacemarks();
    assert.equal(returnedPlacemarks.length, 3);
    await db.placemarkStore.deleteAllPlacemarks();
    returnedPlacemarks = await db.placemarkStore.getAllPlacemarks();
    assert.equal(returnedPlacemarks.length, 0);
  });

  test("get a placemark - success", async () => {
    const placemark = await db.placemarkStore.addPlacemark(user._id, eiffelTower);
    const returnedplacemark = await db.placemarkStore.getPlacemarkById(placemark._id);
    assert.deepEqual(placemark, returnedplacemark);
  });

  test("delete One Placemark - success", async () => {
    const id = testPlacemarks[0]._id;
    await db.placemarkStore.deletePlacemarkById(id, user._id);
    const returnedPlacemarks = await db.placemarkStore.getAllPlacemarks();
    assert.equal(returnedPlacemarks.length, testPlacemarks.length - 1);
    const deletedPlacemark = await db.placemarkStore.getPlacemarkById(id);
    assert.isNull(deletedPlacemark);
  });

  test("get a placemark - bad param", async () => {
    assert.isNull(await db.placemarkStore.getPlacemarkById(""));
    assert.isNull(await db.placemarkStore.getPlacemarkById());
  });

  test("delete One Placemark - fail", async () => {
    await db.placemarkStore.deletePlacemarkById("bad-id");
    const allPlacemarks = await db.placemarkStore.getAllPlacemarks();
    assert.equal(testPlacemarks.length, allPlacemarks.length);
  });

  test("delete others placemark - fail", async () => {
    const user2 = await db.userStore.addUser(testUsers[1]);
    const placemark = await db.placemarkStore.addPlacemark(user._id, eiffelTower);
    const response = await db.placemarkStore.deletePlacemarkById(placemark._id, user2._id);
    assert.isFalse(response);
    const returnedPlacemark = await db.placemarkStore.getPlacemarkById(placemark._id);
    assert.deepEqual(returnedPlacemark, placemark);
  });

  test("get placemarks by categoryId", async () => {
    const categorySightseeingDb = await db.categoryStore.addCategory(categorySightseeing);
    const eiffelTowerWithCategory = { ...eiffelTower, categoryId: categorySightseeingDb._id };
    const eiffelTowerDb = await db.placemarkStore.addPlacemark(user._id, eiffelTowerWithCategory);
    const returnedPlacemarks = await db.placemarkStore.getPlacemarksByCategoryId(categorySightseeingDb._id);
    assert.isArray(returnedPlacemarks);
    assert.lengthOf(returnedPlacemarks, 1);
    assert.deepEqual(returnedPlacemarks[0], eiffelTowerDb);
  });

  test("get placemarks by categoryId - no results", async () => {
    const returnedPlacemarks = await db.placemarkStore.getPlacemarksByCategoryId("test-category-id");
    assert.isArray(returnedPlacemarks);
    assert.lengthOf(returnedPlacemarks, 0);
  });

  test("get placemarks by userId", async () => {
    const placemarks = await db.placemarkStore.getPlacemarksByUserId(user._id);
    assert.equal(placemarks.length, testPlacemarks.length);
    for (let i = 0; i < placemarks.length; i += 1) {
      assert.equal(placemarks[i].userid.toString(), user._id.toString());
    }
  });

  test("get placemarks by userId - no results", async () => {
    const user2 = await db.userStore.addUser(testUsers[1]);
    const placemarks = await db.placemarkStore.getPlacemarksByUserId(user2._id);
    assert.equal(placemarks.length, 0);
  });

  test("Update placemark", async () => {
    const categorySightseeingDb = await db.categoryStore.addCategory(categorySightseeing);
    const eiffelTowerWithCategory = { ...eiffelTower, categoryId: categorySightseeingDb._id };
    const placemark = await db.placemarkStore.addPlacemark(user._id, eiffelTowerWithCategory);
    const updatedPlacemark = { ...placemark, name: "Updated Eiffel Tower" };
    await db.placemarkStore.updatePlacemark(placemark._id, user._id, updatedPlacemark);
    const returnedPlacemark = await db.placemarkStore.getPlacemarkById(placemark._id);
    assert.deepEqual(returnedPlacemark.name, updatedPlacemark.name);
    assert.deepEqual(returnedPlacemark, updatedPlacemark);
  });

  test("Update placemark - fail", async () => {
    const placemark = await db.placemarkStore.addPlacemark(user._id, eiffelTower);
    const updatedPlacemark = { ...placemark, name: "Updated Eiffel Tower" };
    const bool = await db.placemarkStore.updatePlacemark("bad-id", user._id, updatedPlacemark);
    assert.isFalse(bool);
    const returnedPlacemark = await db.placemarkStore.getPlacemarkById(placemark._id);
    assert.deepEqual(returnedPlacemark, placemark);
  });

  suiteTeardown(async () => {
    await db.init(storeType);
    await db.placemarkStore.deleteAllPlacemarks();
    await db.userStore.deleteAll();
    await db.categoryStore.deleteAllCategories();
  });
});
