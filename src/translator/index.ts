import * as check from './check.ts';
import * as tool from './tool.ts';
import TRANSLATION from '../translations/index.ts';

const languageValidation = function (lng: string): void {
  if (!Object.hasOwn(TRANSLATION, lng)) {
    throw new Error('Language was not specified.');
  }
};

/**
 * Converts the commands of a language into @commands.
 */
export const toCode = function (data: string, lng: string): string {
  languageValidation(lng);

  data = data || '';

  return data
    .split('\n')
    .map(function (line) {
      for (const instance of TRANSLATION[lng]) {
        const definition = instance.definition;
        const re = new RegExp('[^@](' + definition + ')|^' + definition, 'ig');
        let reStr;
        while ((reStr = re.exec(line)) !== null) {
          //in line
          const index = reStr[1] ? reStr.index + 1 : reStr.index;
          const value = reStr[1] ? reStr[1] : reStr[0];

          const isPartOfCode = check.isPartOfCode(line, index);
          const isPartOfCommand = check.isPartOfCommand(line, value, index);

          if (isPartOfCode && !isPartOfCommand) {
            const toReplace = instance.command.replace(/\\/g, '');

            const firstPartEndIndex = index;
            const secondPartBeginIndex = index + value.length;
            line = tool.partitionReplace(line, toReplace, firstPartEndIndex, secondPartBeginIndex);
            re.lastIndex = firstPartEndIndex + toReplace.length;
          }
        }
      }

      return line;
    })
    .join('\n');
};

/**
 * Converts @commands into the commands of a language.
 */
export const toText = function (data: string, lng: string): string {
  languageValidation(lng);

  data = data || '';

  return data
    .split('\n')
    .map(function (line) {
      line = ' ' + line + ' ';
      for (const instance of TRANSLATION[lng]) {
        const command = instance.command;
        const re = new RegExp(command, 'ig');
        let reStr;
        while ((reStr = re.exec(line)) !== null) {
          //in line
          const index = reStr.index;
          const value = reStr[0];

          const isPartOfCode = check.isPartOfCode(line, index);
          const isPartOfCommand = check.isPartOfCommand(line, value, index);

          if (isPartOfCode && !isPartOfCommand) {
            const toReplace = instance.definition.split('|')[0];

            const firstPartEndIndex = index;
            const secondPartBeginIndex = index + value.length;
            line = tool.partitionReplace(line, toReplace, firstPartEndIndex, secondPartBeginIndex);
            re.lastIndex = firstPartEndIndex + toReplace.length;
          }
        }
      }

      return line.slice(1, -1);
    })
    .join('\n');
};

/**
 * Translates source code from one language into another.
 */
export const translate = function (source: string, languageInitial: string, languageDestination: string): string {
  const code = toCode(source, languageInitial);
  const text = toText(code, languageDestination);

  return text;
};
