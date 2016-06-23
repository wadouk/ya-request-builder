function browsers() {
  if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
    var customLaunchers = {
      'SL_Chrome' : {
        base : 'SauceLabs',
        browserName : 'chrome'
      },
      'SL_iPhone' : {
        base : 'SauceLabs',
        browserName : 'iphone',
        version : '7.1',
        deviceName : 'iPhone Retina (4-inch)'
      },
      'SL_android' : {
        base : 'SauceLabs',
        version : '4.4',
        browserName : 'android',
        deviceName : 'LG Nexus 4 Emulator'
      },
      'SL_InternetExplorer' : {
        base : 'SauceLabs',
        browserName : 'internet explorer',
        version : '10'
      },
      'SL_InternetExplorer9' : {
        base : 'SauceLabs',
        browserName : 'internet explorer',
        version : '9.0',
        platform : 'windows 7'
      },
      'SL_FireFox' : {
        base : 'SauceLabs',
        browserName : 'firefox',
      }
    };

    return {
      customLaunchers : customLaunchers,
      browsers : Object.keys(customLaunchers),

      sauceLabs : {
        testName : 'hello sauce',
        doctor : true,
        recordScreenshots : false,
        connectOptions : {
          port : 5757,
          logfile : 'sauce_connect.log'
        },
        public : 'public'
      },
      captureTimeout : 120000,
      reporters : ['progress', 'saucelabs'],
    };
  }
  return {
    browsers : ["PhantomJS"],
    reporters : ['progress'],
  }
}

module.exports = function (config) {
  config.set(Object.assign({}, {
    basePath : '',
    frameworks : ['browserify', 'mocha'],
    files : [
      'src/**/*.spec.js'
    ],
    exclude : [],
    preprocessors : {
      "src/**/*.spec.js" : ["browserify"],
    },
    client : {
      captureConsole : true,
      mocha : {
        reporter : 'html',
      },
    },
    browserify : {
      debug : true,
      transform : [["babelify", {"presets" : ["es2015"]}]],
      configure : function (bundle) {
        bundle.on("prebundle", function () {
          console.info("Browserify in progress...");
        });
      },
    },
    proxies : {
      '/ok' : 'http://localhost:6666/ok',
      '/text' : 'http://localhost:6666/text',
      '/delay' : 'http://localhost:6666/delay',
      '/ko' : 'http://localhost:6666/ko',
      '/not-found' : 'http://localhost:6666/not-found',
    },
    port : 9876,
    colors : true,
    logLevel : config.LOG_INFO,
    autoWatch : true,
    singleRun : false,
  }, browsers()));
};
