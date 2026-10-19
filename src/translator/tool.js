exports.partitionReplace = function(sourceCode, toReplace, firstPartEndIndex, secondPartBeginIndex) {
  var firstPart = sourceCode.substring(0, firstPartEndIndex);
  var secondPart = sourceCode.substring(secondPartBeginIndex);
  var fullReplacement = '' + firstPart + toReplace + secondPart;

  return fullReplacement;
};