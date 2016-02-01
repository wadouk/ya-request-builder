"use strict";
var request = require("./xhr");
var RequestBuilder = require("./request-builder");
module.exports = function (Promise) {
    return new RequestBuilder(Promise, request);
};

module.exports.RequestBuilder = RequestBuilder;
