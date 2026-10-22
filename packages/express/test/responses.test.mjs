import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import express from "express";
import { CustomerPortal, Webhooks, checkoutHandler } from "../dist/index.js";

const HTML_PAYLOAD = "<script>alert(1)</script>";
const WEBHOOK_KEY = "dGhpc19pc19hX3BsYWNlaG9sZGVyX3ZhbHVl";

const listen = (handler) =>
  new Promise((resolve) => {
    const server = handler.listen
      ? handler.listen(0, () => resolve(server))
      : createServer(handler).listen(0, () => resolve(server));
  });

const urlOf = (server) => `http://127.0.0.1:${server.address().port}`;

const close = (server) => new Promise((resolve) => server.close(resolve));

describe("express adapter error responses", () => {
  const servers = {};

  before(async () => {
    // Stands in for the Dodo Payments API: every request fails with an error
    // body that contains HTML, as an upstream error quoting caller input would.
    servers.api = await listen((_req, res) => {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(
        JSON.stringify({ message: `Customer ${HTML_PAYLOAD} not found` }),
      );
    });
    process.env.DODO_PAYMENTS_BASE_URL = urlOf(servers.api);

    const app = express();
    app.use(express.json());
    app.all(
      "/checkout",
      checkoutHandler({
        bearerToken: "test-token",
        environment: "test_mode",
        type: "static",
      }),
    );
    app.post("/webhook", Webhooks({ webhookKey: WEBHOOK_KEY }));
    app.get("/portal", CustomerPortal({ bearerToken: "test-token" }));
    servers.app = await listen(app);
  });

  after(async () => {
    delete process.env.DODO_PAYMENTS_BASE_URL;
    await Promise.all(Object.values(servers).map(close));
  });

  const request = (path, init) => fetch(`${urlOf(servers.app)}${path}`, init);

  const assertPlainText = (res) =>
    assert.match(res.headers.get("content-type") ?? "", /^text\/plain\b/);

  test("checkout without productId responds with plain text", async () => {
    const res = await request("/checkout");
    assert.equal(res.status, 400);
    assertPlainText(res);
  });

  test("checkout rejects unsupported methods with plain text", async () => {
    const res = await request("/checkout", { method: "PUT" });
    assert.equal(res.status, 405);
    assertPlainText(res);
  });

  test("webhook with an invalid signature responds with a fixed plain-text body", async () => {
    const res = await request("/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "webhook-id": "msg_test",
        "webhook-timestamp": String(Math.floor(Date.now() / 1000)),
        "webhook-signature": "v1,invalid",
      },
      body: JSON.stringify({ type: HTML_PAYLOAD }),
    });
    assert.equal(res.status, 401);
    assertPlainText(res);
    assert.equal(await res.text(), "Webhook verification failed");
  });

  test("customer portal without customer_id responds with plain text", async () => {
    const res = await request("/portal");
    assert.equal(res.status, 400);
    assertPlainText(res);
  });

  test("customer portal upstream errors containing HTML are served as plain text", async () => {
    const res = await request("/portal?customer_id=cus_test");
    assert.equal(res.status, 500);
    assertPlainText(res);
    assert.ok((await res.text()).includes(HTML_PAYLOAD));
  });
});
