"use strict";

var URI = require("urijs");

var serializer = {
    error : (error) => {
        if (error) {
            return {
                message : error.message || "no response or response ko",
                stack : error.stack || error.toString(),
                name : error.name,
                code : error.code,
                signal : error.signal,
            }
        }
        return error;
    },
    requestBuilder : (requestBuilder) => {
        return {
            method : "GET",
            url : requestBuilder.url.toString(),
            headers : requestBuilder.headers,
        }
    },
    response : (response) => {
        if (response) {
            return {
                statusCode : response.statusCode,
                statusMessage : response.statusMessage,
                headers : response.headers
            }
        }
    },
    all : (error, requestBuilder, response) => {
        return {
            error : serializer.error(error),
            requestBuilder : serializer.requestBuilder(requestBuilder),
            response : serializer.response(response),
        }
    }
};

function instanciate(Promise, request) {
    function RequestBuilder(fromUrl) {
        if ((this instanceof RequestBuilder)) {
            this.url = URI(fromUrl);
            this.headers = {};
            this.json = true
        } else {
            return new RequestBuilder(fromUrl);
        }
    }

    RequestBuilder.prototype.header = function header(name, value) {
        if ((typeof name === "string")) {
            this.headers[name] = value;
        } else {
            this.headers = name;
        }
        return this;
    };

    RequestBuilder.prototype.json = function json(enable) {
        this.json = enable;
        return this;
    };

    RequestBuilder.prototype.query = function query(key, value) {
        if ((typeof key === "string")) {
            this.url.query({[key] : value});
        } else {
            this.url.query(key || {});
        }
        return this;
    };

    RequestBuilder.prototype.path = function path(segments) {
        var newSegment = (segments instanceof Array ? segments : [].slice.call(arguments));
        this.url.segment(
            (newSegment.length === 0 ? newSegment : this.url.segment())
                .concat(newSegment.filter((a) => !!a)));
        return this;
    };

    function resolvePromise(requestBuilder, resolve, reject) {
        return (error, response, body) => {
            if (error || (response && response.statusCode !== 200)) {
                return reject(serializer.all(error, requestBuilder, response));
            }
            return resolve(body);
        };
    }

    RequestBuilder.prototype.get = function send() {
        return new Promise((resolve, reject) => {
            try {
                request.get({url : this.url.toString(), headers : this.headers, json : this.json}, resolvePromise(this, resolve, reject));
            } catch (e) {
                reject(serializer.all(e, this));
            }
        });
    };

    return RequestBuilder;
}

module.exports = instanciate;