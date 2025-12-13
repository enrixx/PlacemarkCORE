import { assert } from "chai";
import dotenv from "dotenv";
import { db } from "../../src/models/db.js";
import { maggie, testUsers } from "../fixtures.js";

dotenv.config();

suite("User Model tests", () => {
  const storeType = process.env.DB_TYPE || "mem";
  console.log(`Running tests with ${storeType} store`);
  setup(async () => {
    await db.init(storeType);
    await db.userStore.deleteAll();
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testUsers[i] = await db.userStore.addUser(testUsers[i]);
    }
  });

  test("create a user", async () => {
    const newUser = await db.userStore.addUser(maggie);
    assert.isDefined(newUser._id);
  });

  test("delete all userApi", async () => {
    let returnedUsers = await db.userStore.getAllUsers();
    // testUsers.length (3) + admin (1) = 4
    assert.equal(returnedUsers.length, 4);
    await db.userStore.deleteAll();
    returnedUsers = await db.userStore.getAllUsers();
    // After deleteAll(), only admin remains
    assert.equal(returnedUsers.length, 1);
  });

  test("get a user - success", async () => {
    const user = await db.userStore.addUser(maggie);
    const returnedUser1 = await db.userStore.getUserById(user._id);
    assert.deepEqual(user, returnedUser1);
    const returnedUser2 = await db.userStore.getUserByEmail(user.email);
    assert.deepEqual(user, returnedUser2);
  });

  test("delete One User - success", async () => {
    await db.userStore.deleteUserById(testUsers[0]._id);
    const returnedUsers = await db.userStore.getAllUsers();
    // testUsers.length (3) - 1 + admin (1) = 3
    assert.equal(returnedUsers.length, 3);
    const deletedUser = await db.userStore.getUserById(testUsers[0]._id);
    assert.isNull(deletedUser);
  });

  test("get a user - failures", async () => {
    const noUserWithId = await db.userStore.getUserById("123");
    assert.isNull(noUserWithId);
    const noUserWithEmail = await db.userStore.getUserByEmail("no@one.com");
    assert.isNull(noUserWithEmail);
  });

  test("get a user - bad params", async () => {
    let nullUser = await db.userStore.getUserByEmail("");
    assert.isNull(nullUser);
    nullUser = await db.userStore.getUserById("");
    assert.isNull(nullUser);
    nullUser = await db.userStore.getUserById();
    assert.isNull(nullUser);
  });

  test("delete One User - fail", async () => {
    await db.userStore.deleteUserById("bad-id");
    const allUsers = await db.userStore.getAllUsers();
    // testUsers.length (3) + admin (1) = 4
    assert.equal(allUsers.length, 4);
  });

  suiteTeardown(async () => {
    await db.init(storeType);
    await db.userStore.deleteAll();
  });
});
