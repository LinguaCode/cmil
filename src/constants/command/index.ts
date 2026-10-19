import MATH from './math.ts';

export default {
  INPUT: '@input',
  OUTPUT: '@output',

  IF: '@if',
  ELSE: '@else',
  THEN: '@then',

  FALSE: '@false',
  TRUE: '@true',

  REPEAT: '@repeat',
  WHILE: '@while',
  DO: '@do',
  TIMES: '@times',

  BREAK: '@break',
  CONTINUE: '@continue',

  OR: '@or',
  AND: '@and',
  NOT: '@not',

  FUNCTION: '@function',

  ...MATH
} as const;
