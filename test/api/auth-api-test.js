import { assert } from "chai";
import { placecoreService } from "./placemark-service.js";
import { decodeToken } from "../../src/api/jwt-utils.js";
import { adminCredentials, maggie, maggieCredentials } from "../fixtures.js";

suite("Authentication API tests", async () => {
  setup(async () => {
    await placecoreService.clearAuth();
    await placecoreService.authenticate(adminCredentials);
    await placecoreService.deleteAllUsers();
  });

  test("authenticate", async () => {
    await placecoreService.createUser(maggie);
    const response = await placecoreService.authenticate(maggieCredentials);
    assert(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async () => {
    const returnedUser = await placecoreService.createUser(maggie);
    const response = await placecoreService.authenticate(maggieCredentials);

    const userInfo = decodeToken(response.token);
    assert.equal(userInfo.email, returnedUser.email);
    assert.equal(userInfo.userId, returnedUser._id);
  });

  test("check Unauthorized", async () => {
    placecoreService.clearAuth();
    try {
      await placecoreService.deleteAllUsers();
      assert.fail("Route not protected");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 401);
    }
  });

  suiteTeardown(async () => {
    await placecoreService.authenticate(adminCredentials);
    await placecoreService.deleteAllUsers();
  });
});
