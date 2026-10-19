export const partitionReplace = function (
  sourceCode: string,
  toReplace: string,
  firstPartEndIndex: number,
  secondPartBeginIndex: number
): string {
  const firstPart = sourceCode.substring(0, firstPartEndIndex);
  const secondPart = sourceCode.substring(secondPartBeginIndex);
  const fullReplacement = '' + firstPart + toReplace + secondPart;

  return fullReplacement;
};
