"use strict";

var objectAssign = require('object-assign');

function onload(options, req, callback) {
  return () => {
    function setBody(response) {
      if (req.responseText.length) {
        var body = options.json ? JSON.parse(req.responseText) : req.responseText;
        return objectAssign({}, {body: body}, response);
      }
      return response;
    }

    var response = {
      statusCode : req.status,
      statusMessage : req.statusText,
      headers : req.getAllResponseHeaders().split(/\r\n/g).filter((headerLine) => headerLine.length)
        .reduce((headers, headerLine) => {
          const tuple = headerLine.split(/: /);
          headers[tuple[0]] = tuple[1];
          return headers;
        }, {}),
    };

    try {
      callback(null, setBody(response));
    } catch (e) {
      response.body = req.responseText;
      callback(e, response)
    }
  }
}

function body(options) {
  if (options.method.match(/POST/gi)) {
    options.headers["content-type"] = "application/json";
    return JSON.stringify(options.body);
  }
}

function xhr(options, callback) {
  var req = new XMLHttpRequest();
  req.open(options.method, options.url, true);
  req.onload = onload(options, req, callback);
  req.onerror = (e) => {
    callback(e, null);
  };

  if (options.json) {
    options.headers["accept"] = "application/json";
  }

  if (typeof(req.withCredentials) !== "undefined" && options.withCredentials) {
    req.withCredentials = true;
  }

  var data = body(options);
  Object.keys(options.headers).forEach((header) => {
    req.setRequestHeader(header, options.headers[header]);
  });

  req.send(data);
  return {
    abort : () => {
      req.abort();
    }
  };
}

module.exports = xhr;
