"use strict";
var expect = require("expect.js");
var Promise = require("bluebird");
var request = require("./server")(Promise);
var server = require("../stubs/server.stub");
var CustomError = require("error.js");

describe("server", () => {

  it("should launch post request", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .post()
        .then((response) => {
          expect(response.body).to.have.property("method", "POST");
        });
    });
  });

  it("should launch patch request", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .patch()
        .then((response) => {
          expect(response.body).to.have.property("method", "PATCH");
        });
    });
  });

  it("should launch put request", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .put()
        .then((response) => {
          expect(response.body).to.have.property("method", "PUT");
        });
    });
  });

  it("should launch del request", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .delete()
        .then((response) => {
          expect(response.body).to.have.property("method", "DELETE");
        });
    });
  });

  it("should add body to post request with the right content-type", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .body({
          test : "test",
          other : {
            something : "ok",
          }
        })
        .post()
        .then((response) => {
          expect(response.body).to.have.property("data", '{"test":"test","other":{"something":"ok"}}');
          expect(response.body.headers).to.have.property("content-type", "application/json");
        });
    });
  });

  it("Should not fail when the response is not gzipped and the gzip flag has been explicitly set to false", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .body({
          test : "test",
          other : {
            something : "ok",
          }
        })
        .gzip(false)
        .post()
        .then((response) => {
          expect(response.body).to.have.property("data", '{"test":"test","other":{"something":"ok"}}');
          expect(response.body.headers).to.have.property("content-type", "application/json");
        });
    });
  });

  it("should handle correctly the body of a post request when the response is gzipped, without having to", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port + "/gzip")
        .body({
          test : "test",
          other : {
            something : "ok",
          }
        })
        .post()
        .then((response) => {
          expect(response.body).to.have.property("data", '{"test":"test","other":{"something":"ok"}}');
          expect(response.body.headers).to.have.property("content-type", "application/json");
        });
    });
  });

  it("should handle correctly the body of a post request when the response is gzipped, and having explicitly set the gzip flag", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port + "/gzip")
        .body({
          test : "test",
          other : {
            something : "ok",
          }
        })
        .gzip(true)
        .post()
        .then((response) => {
          expect(response.body).to.have.property("data", '{"test":"test","other":{"something":"ok"}}');
          expect(response.body.headers).to.have.property("content-type", "application/json");
        });
    });
  });

  it("The query should fail when the response is zipped and the gzip flag has been explicitly set to false", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port + "/gzip")
        .body({
          test : "test",
          other : {
            something : "ok",
          }
        })
        .gzip(false)
        .post()
        .then((response) => {
          expect(response.body).to.be.undefined;
        });
    });
  });

  it("should make a basic request", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .get()
        .then((response) => {
          expect(response.body).to.be.an(Object);
          expect(response.body).to.have.property("data", "");
          expect(response.body).to.have.property("headers");
          expect(response.body.headers).to.have.property("accept", "application/json");
        })
    })
  });

  it("should make a basic gzipped request", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port + "/gzip")
        .get()
        .then((response) => {
          expect(response.body).to.be.an(Object);
          expect(response.body).to.have.property("data", "");
          expect(response.body).to.have.property("headers");
        })
    })
  });

  it("should write headers", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .header("accept-language", "fr-fr")
        .get()
        .then((response) => {
          expect(response.body.headers).to.have.property("accept-language", "fr-fr");
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
          expect(response.body.headers).to.have.property("accept-language", "en-en");
        })
    })
  });

  it("should remove headers", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .header("accept-language", "fr-fr")
        .header()
        .get()
        .then((response) => {
          expect(response.body.headers).to.not.have.key("accept-language");
        })
    })
  });

  it("should have path as array", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .path(["h", "b"])
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/h/b");
        })
    })
  });

  it("should filter falsy path", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .path(["h", undefined])
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/h");
        })
    })
  });

  it("should have path as spread", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .path("h", "b")
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/h/b");
        })
    })
  });

  it("should only append the existing path", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port + "/path")
        .path("h", "b")
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/path/h/b");
        })
    })
  });
  it("should append path if called multiple times", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port + "/path")
        .path("h")
        .path("b")
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/path/h/b");
        })
    })
  });

  it("should reset path", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port + "/path")
        .path([])
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/");
        })
    })
  });

  it("should set query", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query("hello", "world")
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/?hello=world");
        })
    })
  });

  it("should have mutliple query", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query("hello", "world")
        .query("foo", "bar")
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/?hello=world&foo=bar");
        })
    })
  });

  it("should have mutliple query object", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query("hello", "world")
        .query({"foo" : "bar"})
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/?hello=world&foo=bar");
        })
    })
  });

  it("should filter falsy query", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query("hello", undefined)
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/");
        })
    })
  });

  it("should encode query", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query("hello", "heléèloç")
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/?hello=hel%C3%A9%C3%A8lo%C3%A7");
        })
    })
  });

  it("should set query as object", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query({"hello" : "world"})
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/?hello=world");
        })
    })
  });

  it("should filter falsy query key", () => {
    return server.start(200, (port) => {
      return request("http://localhost:" + port)
        .query({"hello" : undefined})
        .get()
        .then((response) => {
          expect(response.body).to.have.property("originalUrl", "/");
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
          expect(response.body).to.have.property("originalUrl", "/");
        })
    })
  });

  it("should get error when it fail", () => {
    return server.start(200, (port) => {
      return request("badhttpstuf")
        .get()
        .catch((error) => {
          expect(error).to.have.keys("message", "stack", "url", "headers");
        })
    })
  });

  it("error should serialize", () => {
    return server.start(200, (port) => {
      return request("badhttpstuff")
        .query({"hello" : "world"})
        .query()
        .get()
        .then(() => {
          throw new Error("fail");
        })
        .catch((err) => {
          expect(CustomError.isCustom(err)).to.be(true);
        });
    });
  });

  describe("can inject cache", () => {
    it("should not call the server when the cache is fulfilled, so answer the cache value", () => {
      return server.start(200, (port) => {
        var executed = false;
        return request("http://localhost:" + port)
          .query({"hello" : "world"})
          .fromCache(() => Promise.resolve({cache : true}))
          .toCache(() => {
            executed = true;
          })
          .get()
          .then((result) => {
            expect(result).to.have.property("cache", true);
            expect(result).not.to.have.key("originalUrl");
            expect(executed).to.be(false);
          })
      });
    });

    it("should call the server when the cache is rejected, so answer the server value", () => {
      return server.start(200, (port) => {
        var toCacheValue = false;
        return request("http://localhost:" + port)
          .query({"hello" : "world"})
          .fromCache(() => Promise.reject({cache : true}))
          .toCache((value) => {
            toCacheValue = value;
          })
          .get()
          .then((response) => {
            expect(response.body).to.have.property("originalUrl", "/?hello=world");
            expect(response.body).not.to.have.key("cache");
            expect(toCacheValue).to.eql(response);
          })
      });
    });
  });

  it("should correctly manage 204 empty", () => {
    return server.start(204, (port) => {
      return request("http://localhost:" + port)
        .header("Cache-Control", "no-cache")
        .get()
        .then((response) => {
          expect(response.body).to.be.undefined;
        })
    })
  });

  it("should correctly manage 401 unauthorized", () => {
    return server.start(401, (port) => {
      return request("http://localhost:" + port)
        .header("Cache-Control", "no-cache")
        .get()
        .then((response) => {
          expect(response.body).to.be.an(Object);
          expect(response.body).to.have.property("data", "");
          expect(response.body).to.have.property("headers");
          expect(response.body.headers).to.have.property("accept", "application/json");
        })
    })
  });
});
