"use strict";

function onload(options, req, callback) {
  return () => {
    callback(null,
      {
        statusCode : req.status,
        statusMessage : req.statusText,
        headers : req.getAllResponseHeaders().split(/\r\n/g).reduce((headers, headerLine) => {
          const tuple = headerLine.split(/: /);
          headers[tuple[0]] = tuple[1];
          return headers;
        }, {}),
      },
      options.json ? JSON.parse(req.responseText) : req.responseText
    );
  }
}

function xhr(options, callback, method) {
  var req = new XMLHttpRequest();
  req.open(method, options.url, true);
  req.onload = onload(options, req, callback);
  Object.keys(options.headers).forEach((header) => {
    req.setRequestHeader(header, options.headers[header]);
  });
  req.send(method === "POST" ? options.body : null);
  return {
    abort : () => {
      req.abort();
    }
  };
}

function methodFunc(method) {
  return function(options, callback) {
    return xhr(options, callback, method);
  }
}

module.exports = {
  get : methodFunc("GET"),
  post : methodFunc("POST"),
};
