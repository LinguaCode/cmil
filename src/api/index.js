/**
 * @author Arman Yeghiazaryan
 * @copyright LinguaCode 2016
 * @license GPLv3
 */

var path = require('path');
var fs = require('fs');
var express = require('express');
var debug = require('debug')('LC:api:init');
var serverRoot = path.join(process.cwd(), 'src');
var reflection = require(path.join(serverRoot, '/libs/reflection'));
var app = module.exports = express();

var apiRoutesPath = path.join(serverRoot, 'api/routes');
var apiHandlersPath = path.join(serverRoot, 'api/handlers');
var apiServicesPath = path.join(serverRoot, 'api/services');

function initializeRoutes() {
  var routes = fs.readdirSync(apiRoutesPath);

  for (var i = routes.length; i--;) {
    if (routes[i] === 'error.js') {
      continue;
    }

    initializeRoute(routes[i]);
  }
}

function initializeRoute(route) {
  var routerPath = path.join(apiRoutesPath, route);
  var router = require(routerPath);
  var routerParams = [app].concat(getHandlers(router));

  router.apply(router, routerParams);
}

function getHandlers(router) {
  var handlers = reflection.getParamNames(router);

  if (handlers[0] === 'app') {
    handlers.shift();
  }

  return handlers.map(function (handler) {
    return getHandlerInstance(require(path.join(apiHandlersPath, handler)));
  });
}

function getHandlerInstance(handlerConstructor) {
  
  var params = reflection
    .getParamNames(handlerConstructor)
    .map(function (dep) {
      return require(path.join(apiServicesPath, dep));
    });

  return construct(handlerConstructor, params);
}

function construct(constructor, args) {
  function F() {
    constructor.apply(this, args);
  }

  F.prototype = constructor.prototype;
  return new F();
}


app.use(function (req, res, next) {
  req.app = app;
  next();
});

debug('initializing api routes');
initializeRoutes();
