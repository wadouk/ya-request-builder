"use strict";

var expect = require("expect.js");
var Promise = require("bluebird");
var request = require("./browser")(Promise);

describe("browser", () => {
  it("should make a basic request", () => {
    return request("http://localhost:9876/ok")
      .get()
      .then((response) => {
        expect(response).to.be.an(Object);
        expect(response).to.have.property("data", "");
        expect(response).to.have.property("headers");
      })
  });

  it("should write headers", () => {
    return request("http://localhost:9876/ok")
      .header("accept-language", "fr-fr")
      .get()
      .then((response) => {
        expect(response.headers).to.have.property("accept-language", "fr-fr");
      })
  });

  it("should set query", () => {
    return request("http://localhost:9876/ok")
      .query("hello", "world")
      .get()
      .then((response) => {
        expect(response).to.have.property("originalUrl", "/ok?hello=world");
      })
  });

  it("should encode query", () => {
    return request("http://localhost:9876/ok")
      .query("hello", "heléèloç")
      .get()
      .then((response) => {
        expect(response).to.have.property("originalUrl", "/ok?hello=hel%C3%A9%C3%A8lo%C3%A7");
      })
  });

  it("when it fail get error", () => {
    return request("http://localhost:9876/ko")
      .get()
      .then(() => {
        throw new Error("fail");
      })
      .catch((error) => {
        expect(error).to.have.keys("error", "requestBuilder", "response");
        expect(error.response).to.have.property("statusCode", 500);
        expect(error.response).to.have.property("statusMessage", "Internal Server Error");
        expect(error.response).to.have.property("headers");
        expect(error.response.headers).to.be.an(Object);
      })
  })
});
