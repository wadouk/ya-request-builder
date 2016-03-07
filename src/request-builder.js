"use strict";

var URI = require("urijs");
var CustomError = require("error.js");
var RequestRejected = CustomError.create("RequestRejected");
var assign = require("object-assign");

var serializer = {
  error : (error) => {
    if (error) {
      return {
        message : error.message,
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
    return new RequestRejected({
      message : {
        error : serializer.error(error),
        requestBuilder : serializer.requestBuilder(requestBuilder),
        response : serializer.response(response),
      },
      stack : error ? (error.stack || error.toString()) : "",
    })
  }
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
        reject(serializer.all(e, requestBuilder));
      }
    }

    return () => {
      var answer = () => new Promise(sendPromise);
      if (requestBuilder._before)
        return requestBuilder._before().catch(answer);
      return answer();
    }
  }

  function RequestBuilder(fromUrl) {
    if ((this instanceof RequestBuilder)) {
      this.url = URI(fromUrl);
      this.headers = {};
      this._json = true;
      this._gzip = true;
      ["get", "post"].forEach((method) => {
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

  RequestBuilder.prototype.before = function before(promise) {
    this._before = promise;
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
    return (error, response, body) => {

      if (error || (response && !(response.statusCode >= 200 && response.statusCode <= 299))) {
        return reject(serializer.all(error, requestBuilder, response));
      }
      return resolve(body);
    };
  }

  return RequestBuilder;
}

module.exports = instanciate;
module.exports.Error = RequestRejected;
