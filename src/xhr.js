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

function xhr(method) {
  return (options, callback) => {
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
}

module.exports = {
  get : xhr("GET"),
  post : xhr("POST")
};
