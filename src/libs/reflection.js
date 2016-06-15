var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;


exports.getParamNames = function getParamNames(func) {
  //uncomment the function
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');

  //slice the <arguments string> of route's function
  var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

  return result || [];
};
