import { assert } from "chai";
import { db } from "../src/models/db.js";
import { eiffelTower, testPlacemarks,testUsers } from "./fixtures.js";

suite("Placemark Model tests", () => {
  let user = null;

  setup(async () => {
    db.init("json");
    await db.placemarkStore.deleteAllPlacemarks();
    await db.userStore.deleteAll();
    user = await db.userStore.addUser(testUsers[0]);
    for (let i = 0; i < testPlacemarks.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testPlacemarks[i] = await db.placemarkStore.addPlacemark(user._id, testPlacemarks[i]);
    }
  });

  test("create a placemark", async () => {
    const newPlacemark = await db.placemarkStore.addPlacemark(user._id, eiffelTower);
    assert.equal(newPlacemark, eiffelTower);
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

  suiteTeardown(async () => {
    db.init("json");
    await db.placemarkStore.deleteAllPlacemarks();
    await db.userStore.deleteAll();
  });
});

