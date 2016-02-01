"use strict";
var expect = require("expect.js");
var Promise = require("bluebird");
var request = require("./server")(Promise);
var server = require("./server.stub");
describe("server", () => {

  it("should make a basic request", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .get()
        .then((response) => {
          expect(response).to.be.an(Object);
          expect(response).to.have.property("data", "");
          expect(response).to.have.property("headers");
        })
    })
  });

  it("should write headers", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .header("accept-language", "fr-fr")
        .get()
        .then((response) => {
          expect(response.headers).to.have.property("accept-language", "fr-fr");
        })
    })
  });

  it("should write headers as object that replace all previous headers", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .header("accept-language", "fr-fr")
        .header({"accept-language" : "en-en"})
        .get()
        .then((response) => {
          expect(response.headers).to.have.property("accept-language", "en-en");
        })
    })
  });

  it("should write headers as object that replace all previous headers", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .header("accept-language", "fr-fr")
        .header()
        .get()
        .then((response) => {
          expect(response.headers).to.not.have.key("accept-language");
        })
    })
  });

  it("should have path as array", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .path(["h", "b"])
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/h/b");
        })
    })
  });

  it("should filter falsy path", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .path(["h", undefined])
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/h");
        })
    })
  });

  it("should have path as spread", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .path("h", "b")
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/h/b");
        })
    })
  });

  it("path should only append the existing path", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port + "/path")
        .path("h", "b")
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/path/h/b");
        })
    })
  });

  it("path could be reseted", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port + "/path")
        .path([])
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/");
        })
    })
  });

  it("should set query", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query("hello", "world")
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/?hello=world");
        })
    })
  });

  it("should filter falsy query", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query("hello", undefined)
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/");
        })
    })
  });

  it("should encode query", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query("hello", "heléèloç")
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/?hello=hel%C3%A9%C3%A8lo%C3%A7");
        })
    })
  });

  it("should set query as object", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query({"hello" : "world"})
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/?hello=world");
        })
    })
  });

  it("should filter falsy query key", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query({"hello" : undefined})
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/");
        })
    })
  });

  it("should set empty query should empty previous set query", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query({"hello" : "world"})
        .query()
        .get()
        .then((response) => {
          expect(response).to.have.property("originalUrl", "/");
        })
    })
  });

  it("when it fail get error", () => {
    return server.start(500, (port) => {
      return request("http://localhost:" + port)
        .query({"hello" : "world"})
        .query()
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
  })
});
