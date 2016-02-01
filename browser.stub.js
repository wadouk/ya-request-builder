"use strict";
var express = require("express");
var app = express();

var server = app.listen(6666, ()=> {
    console.log("hello %d", server.address().port);
});

function back(status) {
    return (req, res) => {
        var data = [];
        req.on("data", (chunk) => {
            console.log("chunk", chunk.toString());
            data.push(chunk);
        });
        req.on("end", () => {
            res.status(status).send({
                data : data.toString(),
                headers : req.headers,
                originalUrl : req.originalUrl,
            });
        })
    }
}

app.use("/ok", back(200));

app.use("/ko", back(500));

app.use("/not-found", back(404));

app.use("/stop", (req, res) => {
    res.sendStatus(200);
    server.close();
});
