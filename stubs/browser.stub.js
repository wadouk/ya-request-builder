"use strict";
var express = require("express");
var app = express();
const stub = require("./middleware.stub");

var server = app.listen(6666, ()=> {
  console.log("hello %d", server.address().port);
});

app.use("/ok", stub(200));
app.use("/text", (req, res) => {
  res.send("hello");
});

app.use("/delay", (req, res) => {
  setTimeout(() => {
    stub(200)(req, res)
  }, 5000);
});

app.use("/ko", stub(500));

app.use("/not-found", stub(404));

app.use("/stop", (req, res) => {
  res.sendStatus(200);
  server.close();
});
