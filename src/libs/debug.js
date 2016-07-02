let _ = require('lodash');
var colors = require('colors');

let env = process.env.NODE_ENV;
let colorReservation = [];

let isScopeOpened = function (text) {
  let listOfReservedTexts = _.map(colorReservation, 'command');

  let indexOfFistResult = listOfReservedTexts.indexOf(text);
  let isAnyCopy = indexOfFistResult != -1;

  if (isAnyCopy) {
    let indexOfLastResult = listOfReservedTexts.lastIndexOf(text);
    if (indexOfFistResult == indexOfLastResult) {
      return true;
    }
  }

  return false;
};

let indentGenerate = function () {
  let space = ' ';
  let spaces = '';

  for (let i = 0; i < 4; i++) {
    spaces += space;
  }

  return spaces;
};
let indentsGenerate = function (levels) {
  let indent = indentGenerate();
  let indents = '';
  for (let i = 0; i < levels; i++) {
    indents += indent;
  }

  return indents;
};

let colorParamsGenerate = function (index) {
  const colorList = [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'gray',
    'grey'
  ];
  const backgroundList = [
    'bgBlack',
    'bgRed',
    'bgGreen',
    'bgYellow',
    'bgBlue',
    'bgMagenta',
    'bgCyan',
    'bgWhite'
  ];

  let countOfBackgrounds = backgroundList.length;
  let countOfColors = colorList.length;

  let indexOfBackground = Math.floor(index / countOfColors);
  indexOfBackground =
    indexOfBackground <= countOfBackgrounds ?
      indexOfBackground :
    indexOfBackground - countOfBackgrounds;

  let indexOfColor =
    index <= countOfColors ?
      index :
    index % countOfColors;


  return {
    background: backgroundList[indexOfBackground],
    text: colorList[indexOfColor]
  }
};
let oldSibling = function (command) {
  let listOfReservedTexts = _.map(colorReservation, 'command');
  let indexOfLastResult = listOfReservedTexts.lastIndexOf(command);

  if (indexOfLastResult != -1) {
    return colorReservation[indexOfLastResult];
  }

  return false;
};

let getLastIndentIndex = function (colorReservationList, command) {
  let countOfReservedColors = colorReservation.length;
  if (countOfReservedColors == 0) {
    return 0;
  }

  let sibling = oldSibling(command);
  if (sibling) {
    return sibling.indent;
  }

  return colorReservationList[countOfReservedColors - 1].indent;
};

module.exports = function (command) {
  let colorParams;
  let indents;
  if (!isScopeOpened(command)) {
    let countOfReservedColors = colorReservation.length;
    colorParams = colorParamsGenerate(countOfReservedColors);

    indents = indentsGenerate(indexOfLevel);
  } else {
    let sibling = oldSibling(command);
    colorParams = sibling.colors;

    indents = indentsGenerate(indexOfLevel - 1);
  }

  let indentParam = getLastIndentIndex(colorReservation, command);
  colorReservation.push({
    command: command,
    colors: colorParams,
    indent: indentParam
  });

  let text = indents + command;

  let backgroundColor = colorParams.background;
  let textColor = colorParams.text;
  if (env == 'testing') {
    console.log(colors[backgroundColor][textColor](text));
  }
};