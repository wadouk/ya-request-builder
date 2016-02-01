"use strict";
var request = require("./xhr-facade");
var RequestBuilder = require("./src/request-builder");
module.exports = function (Promise) {
    return new RequestBuilder(Promise, request);
};

module.exports.RequestBuilder = RequestBuilder;
