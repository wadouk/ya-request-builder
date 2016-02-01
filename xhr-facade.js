"use strict";

function onload(options, req, callback) {
  return () => {
    callback(null,
      {statusCode : req.status},
      options.json ? JSON.parse(req.responseText) : req.responseText
    );
  }
}

function xhr(options, callback) {
  if (window.XMLHttpRequest) {
    var req = new XMLHttpRequest();
    req.open('GET', options.url, true);
    req.onload = onload(options, req, callback);
    req.send(null);
  } else {
    callback(new Error("no XMLHttpRequest"))
  }
}

module.exports = {
  get : xhr
};
