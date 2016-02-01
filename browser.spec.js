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
});
