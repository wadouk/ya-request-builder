"use strict";

var Promise = require("bluebird");
module.exports = {
    start : (statusCode, cb) => {
        var app = require("express")();
        app.use("/", (req, res) => {
            var data = [];
            req.on("data", (chunk) => {
                console.log("chunk", chunk.toString());
                data.push(chunk);
            });
            req.on("end", () => {
                res.status(statusCode).send({
                    data : data.toString(),
                    headers : req.headers,
                    originalUrl : req.originalUrl,
                });
            })
        });

        var port = parseInt(1024 + ((Math.random()) * 1000), 10);

        var server;
        return new Promise((resolve) => {
            server = app.listen(port, () => {
                resolve(port)
            });
        }).then(cb).finally(() => {
            server ? server.close.bind(server)() : () => {}
        })
    }
};