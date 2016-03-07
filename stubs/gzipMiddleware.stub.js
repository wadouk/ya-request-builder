"use strict";
var zlib = require("zlib");

function gzipData(res, rawData, status) {
  var bufferedResponse = new Buffer(JSON.stringify(rawData));
  return zlib.gzip(bufferedResponse, (_, gzippedResponse) => {
    res.setHeader("content-encoding", "gzip");
    res.status(status)
      .end(gzippedResponse);
  });
}

module.exports = (status) => {
  return (req, res) => {
    var dataChunks = [];

    req.on("data", (chunk) => {
      dataChunks.push(chunk);
    });

    req.on("end", () => {
      var rawResponse = {
        data : dataChunks.toString(),
        headers : req.headers,
        originalUrl : req.originalUrl,
        method : req.method,
        body : req.body,
      };
      gzipData(res, rawResponse, status);
    })
  }
};
