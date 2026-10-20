import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'διάβασε'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'γράψε'
  },
  {
    command: COMMAND.IF,
    definition: 'αν'
  },
  {
    command: COMMAND.ELSE,
    definition: 'αλλιώς'
  },
  {
    command: COMMAND.THEN,
    definition: 'τότε'
  },
  {
    command: COMMAND.OR,
    definition: 'ή'
  },
  {
    command: COMMAND.AND,
    definition: 'και'
  },
  {
    command: COMMAND.NOT,
    definition: 'όχι'
  },
  {
    command: COMMAND.FALSE,
    definition: 'ψευδής'
  },
  {
    command: COMMAND.TRUE,
    definition: 'αληθής'
  },
  {
    command: COMMAND.DO,
    definition: 'κάνε'
  },
  {
    command: COMMAND.WHILE,
    definition: 'όσο'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'επανάλαβε'
  },
  {
    command: COMMAND.TIMES,
    definition: 'φορές'
  },
  {
    command: COMMAND.BREAK,
    definition: 'διάκοψε'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'συνέχισε'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'συνάρτηση'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'τυχαία'
  },
  {
    command: COMMAND.POW,
    definition: 'δύναμη'
  },
  {
    command: COMMAND.SQR,
    definition: 'τετράγωνο'
  },
  {
    command: COMMAND.SQRT,
    definition: 'τετραγωνική_ρίζα'
  },
  {
    command: COMMAND.ROUND,
    definition: 'στρογγυλοποίηση'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'στρογγυλοποίηση_κάτω'
  },
  {
    command: COMMAND.CEIL,
    definition: 'στρογγυλοποίηση_πάνω'
  },
  {
    command: COMMAND.ABS,
    definition: 'απόλυτη_τιμή'
  },
  {
    command: COMMAND.SIN,
    definition: 'sin'
  },
  {
    command: COMMAND.COS,
    definition: 'cos'
  },
  {
    command: COMMAND.TAN,
    definition: 'tan'
  },
  {
    command: COMMAND.CTG,
    definition: 'ctg'
  },
  {
    command: COMMAND.ARCSIN,
    definition: 'arcsin'
  },
  {
    command: COMMAND.ARCCOS,
    definition: 'arccos'
  },
  {
    command: COMMAND.ARCTAN,
    definition: 'arctan'
  },
  {
    command: COMMAND.ARCCTG,
    definition: 'arcctg'
  },
  {
    command: COMMAND.LOG,
    definition: 'log'
  },
  {
    command: COMMAND.LN,
    definition: 'ln'
  },
  {
    command: COMMAND.LG,
    definition: 'lg'
  },
  {
    command: COMMAND.PI,
    definition: 'pi'
  },
  {
    command: COMMAND.E,
    definition: 'e'
  }
];

export default translation;
