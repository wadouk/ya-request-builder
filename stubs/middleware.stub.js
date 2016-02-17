"use strict";

module.exports = (status) => {
  return (req, res) => {
    var data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });
    req.on("end", () => {
      res.status(status).send({
        data : data.toString(),
        headers : req.headers,
        originalUrl : req.originalUrl,
        method : req.method,
        body : req.body,
      });
    })
  }
};
