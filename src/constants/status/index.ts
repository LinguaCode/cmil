import ERROR from './error.ts';

export default {
  WAITS_FOR_INPUT: 'waitsForInput',
  SESSION_END: 'sessionEnd',

  ...ERROR
} as const;
