"use strict";

var Promise = require("bluebird");
var stub = require("./middleware.stub");
var gzipStub = require("./gzipMiddleware.stub");

module.exports = {
  start : (statusCode, cb) => {
    var app = require("express")();

    app.use("/gzip", gzipStub(statusCode));
    app.use("/", stub(statusCode));

    var port = parseInt(1024 + ((Math.random()) * 1000), 10);

    var server;
    return new Promise((resolve) => {
      server = app.listen(port, () => {
        resolve(port)
      });
    }).then(cb).finally(() => {
      server ? server.close.bind(server)() : () => {
      }
    })
  }
};
