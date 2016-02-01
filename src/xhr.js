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

function xhr(options, callback) {
  var req = new XMLHttpRequest();
  req.open('GET', options.url, true);
  req.onload = onload(options, req, callback);
  Object.keys(options.headers).forEach((header) => {
    req.setRequestHeader(header, options.headers[header]);
  });
  req.send(null);
}

module.exports = {
  get : xhr
};
