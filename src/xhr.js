"use strict";

function onload(options, req, callback) {
  return () => {
    var response = {
      statusCode : req.status,
      statusMessage : req.statusText,
      headers : req.getAllResponseHeaders().split(/\r\n/g).reduce((headers, headerLine) => {
        const tuple = headerLine.split(/: /);
        headers[tuple[0]] = tuple[1];
        return headers;
      }, {}),
    };

    try {
      var body = options.json ? JSON.parse(req.responseText) : req.responseText;
      callback(null, response, body);
    } catch (e) {
      callback(e, response, req.responseText)
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

  if (options.json) {
    options.headers["accept"] = "application/json";
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
