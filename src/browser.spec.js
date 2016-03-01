"use strict";

var expect = require("expect.js");
var Promise = require("bluebird");
var request = require("./browser")(Promise);


describe("browser", () => {
  beforeEach(() => {
    Promise.config({cancellation : true});
  });

  it("should make a post request", () => {
    return request("http://localhost:9876/ok")
      .post()
      .then((response) => {
        expect(response).to.be.an(Object);
        expect(response).to.have.property("method", "POST");
      })
  });

  it("should make a post request with data", () => {
    return request("http://localhost:9876/ok")
      .body(JSON.stringify({"test":"test"}))
      .post()
      .then((response) => {
        expect(response).to.have.property("data", '{"test":"test"}');
      })
  });


  it("should make a basic request", () => {
    return request("http://localhost:9876/ok")
      .get()
      .then((response) => {
        expect(response).to.be.an(Object);
        expect(response).to.have.property("data", "");
        expect(response).to.have.property("headers");
      })
  });

  it("should fail properly if not json return", () => {
    var delayed = request("http://localhost:9876/text").get();
    return delayed.finally(() => {
      var status = {
        canceled : delayed.isCancelled(),
        fulfilled : delayed.isFulfilled(),
        rejected : delayed.isRejected(),
        pending : delayed.isPending(),
        resolved : delayed.isResolved(),
      };
      expect(status).to.have.property("rejected", true);
      expect(status).to.have.property("resolved", true);
    }).catch((e) => {
      expect(e.message.error.name).to.be("SyntaxError");
    });
  });

  it("should write headers", () => {
    return request("http://localhost:9876/ok")
      .header("accept-language", "fr-fr")
      .query("ts", Date.now())
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

  it("should not load the response if the server take to much time to answer", (done) => {
    function delay(delay, cb) {
      return Promise.delay(delay).then(cb);
    }

    var delayed = delay(20, () => {
      return request("http://localhost:9876/delay").get();
    });

    var other = delay(40, () => {
      delayed.cancel();
    });

    return Promise.join(other, delayed)
      .finally(() => {
        var status = {
          canceled : delayed.isCancelled(),
          fulfilled : delayed.isFulfilled(),
          rejected : delayed.isRejected(),
          pending : delayed.isPending(),
          resolved : delayed.isResolved(),
        };
        try {
          expect(status).to.have.property("canceled", true);
          done();
        } catch (e) {
          done(e)
        }
      });
  })
});
