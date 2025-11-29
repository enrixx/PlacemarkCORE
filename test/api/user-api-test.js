import { assert } from "chai";
import { placecoreService } from "./placemark-service.js";
import { maggie, maggieCredentials, testUsers, adminCredentials } from "../fixtures.js";
import { assertSubset } from "../test-utils.js";
import { seedAdmin } from "../../src/models/seed-admin.js";

suite("User API tests", () => {
  const storeType = process.env.DB_TYPE || "mem";
  setup(async () => {
    placecoreService.clearAuth();
    await seedAdmin(storeType);
    await placecoreService.authenticate(adminCredentials);
    await placecoreService.deleteAllUsers();
  });

  test("create a user", async () => {
    const newUser = await placecoreService.createUser(maggie);
    assertSubset(maggie, newUser);
    assert.isDefined(newUser._id);
  });

  test("Unauthorized delete", async () => {
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await placecoreService.createUser(testUsers[i]);
    }
    try {
      await placecoreService.deleteAllUsers();
      assert.fail("Unauthorized delete should have failed");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 401);
    }
  });

  test("Forbidden delete", async () => {
    await placecoreService.createUser(maggie);
    try {
      await placecoreService.authenticate(maggieCredentials);
      await placecoreService.deleteAllUsers();
      assert.fail("Forbidden delete should have failed");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  suiteTeardown(async () => {
    await seedAdmin(storeType);
    await placecoreService.authenticate(adminCredentials);
    await placecoreService.deleteAllUsers();
  });
});
