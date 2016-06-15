var fs = require('fs');
var reservedWords = require('./reservedWords');
var tools = require('./../libs/tools');

exports.levels = {
  /**
   * Output the message about in which line is the error is exists.
   *
   *  @example
   * exports.levels.spaces(5);
   * // returns -25
   *
   * @param {Number} lineNumber
   * @returns {String} Returns the error message for the line.
   */
  spaces: function (lineNumber) {
    return 'space error in ' + lineNumber + ' line';
  }
};

exports.evalResult = function (error) {
  var errorMessage = error.message;
  var errorStatus;
  var errorRegEx = {
    unexpectedIdentifier: /Unexpected identifier/i,
    isNotDefined: /is not defined/
  };

  if (errorRegEx.unexpectedIdentifier.test(errorMessage)) {
    //errorStatus = 'Կոդի ուղղագրության սխալ։';
    errorStatus = 'Կոդում առկա է ուղղագրական։';
  } else if (errorRegEx.isNotDefined.test(errorMessage)) {
    //var errorCoordinates = error.stack.match(/\d:\d/)[0].split(':');
    //var errorLine = parseInt(errorCoordinates[0]) - 7;
    //var errorRow = parseInt(errorCoordinates[1]);
    var undefinedVariableName = error.message.match(/(.*) is not defined/)[1];

    errorStatus = 'Գրված «' + undefinedVariableName + '» փոփոխականը հայտարարված չէ։'/*
     + '\nՏես տող՝ ' + errorLine + ', դիրք՝ ' + errorRow + '։'*/;
  } else {
    //errorStatus = 'Կոդում առկա է անհայտ սխալ, խնդրում ենք կապնվել ադմինիստրացիայի հետ եւ սխալը շուտափույթ կուղղվի ：)';
    errorStatus = 'Կոդում առկա է ուղղագրական սխալ։';
  }

  return errorStatus;
};

exports.isHackAttempted = function (sourceCode) {
  for (var i = 0; i < reservedWords.length; i++) {
    var regExp = new RegExp(reservedWords[i], 'g');
    if (regExp.test(sourceCode) && tools.isPartOfCode(sourceCode, regExp.lastIndex - reservedWords[i].length)) {
      return true;
    }
  }

  return false;
};