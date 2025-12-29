import { assert } from "chai";
import { placecoreService } from "./placemark-service.js";
import { maggie, maggieCredentials, testUsers, adminCredentials } from "../fixtures.js";
import { assertSubset } from "../test-utils.js";

suite("User API tests", () => {
  setup(async () => {
    placecoreService.clearAuth();
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

    await placecoreService.clearAuth();
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
    await placecoreService.authenticate(adminCredentials);
    await placecoreService.deleteAllUsers();
  });
});
