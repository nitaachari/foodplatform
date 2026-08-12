const request = require("supertest");
const app = require("./app");

test("unknown routes return 404", async () => {
  const response = await request(app).get("/this-route-does-not-exist");
  expect(response.statusCode).toBe(404);
});
test("protected route rejects a request with no token", async () => {
  const response = await request(app).get("/api/orders/my");
  expect(response.statusCode).toBe(401);
});
