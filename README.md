[![Build Status](https://travis-ci.org/wadouk/ya-request-builder.svg?branch=master)](https://travis-ci.org/wadouk/ya-request-builder)

# Isomorphic or universal http client because no one exist like I need

On server that manage for proxy because : 

- companies sucks
- need to handle all types of proxies, like https ones
- and [request](https://www.npmjs.com/package/request) handle it perfectly

Simple in the browser : 

- only a facade from XmlHTTPRequest to act the more like  
- because request handle proxy as environment configuration

As builder because :

- this pattern is great to instantiate an object for readability

Yet another because so much alternatives already exists but no one fully worked :

- [superagent](https://www.npmjs.com/package/superagent) & [superagent proxy](https://www.npmjs.com/package/superagent-proxy) doesn't make the isomorphic way
- as it doesn't work on https but probably a but of proxy-agent
- [request](https://www.npmjs.com/package/request) & [browserify](https://www.npmjs.com/package/browserify) for a simple get has 1.8M bundled (unminified unmangled)
- [iso-http](https://www.npmjs.com/package/iso-http) doesn't handle proxy like it works on bult-in node module http

All I need to do

- I need two implementations of the request : one with request and the other with XmlHTTPRequest
- Handle the response as promise because it's better than callbacks
