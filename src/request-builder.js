"use strict";

var URI = require("urijs");
var CustomError = require("error.js");
var RequestFailed = CustomError.create("RequestFailed");
var assign = require("object-assign");

function serializeError(error, requestBuilder) {
  return new RequestFailed({
    message : error.message,
    url : requestBuilder.url.toString(),
    headers : requestBuilder.headers,
    stack : error ? (error.stack || error.toString()) : "",
  })
};

function instanciate(Promise, request) {
  function send(method, requestBuilder) {
    function sendPromise(resolve, reject, onCancel) {
      try {
        var req = request({
          method : method,
          url : requestBuilder.url.toString(),
          headers : requestBuilder.headers,
          json : requestBuilder._json,
          body : requestBuilder._body,
          gzip : requestBuilder._gzip,
        }, resolvePromise(requestBuilder, resolve, reject));

        onCancel && onCancel(() => {
          req.abort();
        });
      } catch (e) {
        reject(serializeError(e, requestBuilder));
      }
    }

    return () => {
      var runToCache = (value) => {
        requestBuilder._toCache(value);
        return value;
      };
      var answer = () => new Promise(sendPromise).then(runToCache);
      if (requestBuilder._fromCache) {
        return requestBuilder._fromCache().catch(answer);
      }
      return answer();
    }
  }

  function RequestBuilder(fromUrl) {
    if ((this instanceof RequestBuilder)) {
      this.url = URI(fromUrl);
      this.headers = {};
      this._json = true;
      this._gzip = true;
      this._toCache = () => {
      };
      ["get", "post", "patch", "put", "delete"].forEach((method) => {
        this[method] = send(method, this);
      });
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
    this._json = enable;
    return this;
  };

  RequestBuilder.prototype.fromCache = function fromCache(promise) {
    this._fromCache = promise;
    return this;
  };

  RequestBuilder.prototype.toCache = function toCache(promise) {
    this._toCache = promise;
    return this;
  };

  RequestBuilder.prototype.query = function query(key, value) {
    if (key) {
      this.url.addQuery((typeof key === "string") ? {[key] : value} : key);
    } else {
      this.url.query({});
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

  RequestBuilder.prototype.body = function body(data) {
    this._body = data;
    return this;
  };

  RequestBuilder.prototype.gzip = function gzip(enableGzip) {
    this._gzip = enableGzip;
    return this;
  };

  function resolvePromise(requestBuilder, resolve, reject) {
    return (error, response) => {
      if (error) {
        return reject(serializeError(error, requestBuilder));
      }
      return resolve(response);
    };
  }

  return RequestBuilder;
}

module.exports = instanciate;
module.exports.Error = RequestFailed;
