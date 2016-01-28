"use strict";
var request = require("request");
var RequestBuilder = require("./src/request-builder");
module.exports = function (Promise) {
    return new RequestBuilder(Promise, request);
};