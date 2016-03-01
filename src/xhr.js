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

function methodFunc(method) {
  return function(options, callback) {
    return xhr(options, callback, method);
  }
}

module.exports = {
  get : methodFunc("GET"),
  post : methodFunc("POST"),
};
