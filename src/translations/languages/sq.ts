import {COMMAND} from '../../constants/index.ts';
import type {Translation} from '../index.ts';

const translation: Translation[] = [
  {
    command: COMMAND.INPUT,
    definition: 'të_dhëna',
    note: 'Means data; would lexo (read) be better?'
  },
  {
    command: COMMAND.OUTPUT,
    definition: 'shkruaj'
  },
  {
    command: COMMAND.IF,
    definition: 'nëse'
  },
  {
    command: COMMAND.ELSE,
    definition: 'përndryshe'
  },
  {
    command: COMMAND.THEN,
    definition: 'atëherë'
  },
  {
    command: COMMAND.OR,
    definition: 'ose'
  },
  {
    command: COMMAND.AND,
    definition: 'dhe'
  },
  {
    command: COMMAND.NOT,
    definition: 'jo'
  },
  {
    command: COMMAND.FALSE,
    definition: 'e rreme'
  },
  {
    command: COMMAND.TRUE,
    definition: 'e vërtetë'
  },
  {
    command: COMMAND.DO,
    definition: 'bëj'
  },
  {
    command: COMMAND.WHILE,
    definition: 'përderisa'
  },
  {
    command: COMMAND.REPEAT,
    definition: 'përsërit'
  },
  {
    command: COMMAND.TIMES,
    definition: 'herë'
  },
  {
    command: COMMAND.BREAK,
    definition: 'ndalo'
  },
  {
    command: COMMAND.CONTINUE,
    definition: 'vazhdo'
  },
  {
    command: COMMAND.FUNCTION,
    definition: 'funksioni'
  },
  {
    command: COMMAND.RANDOM,
    definition: 'të_rastit'
  },
  {
    command: COMMAND.POW,
    definition: 'fuqi'
  },
  {
    command: COMMAND.SQR,
    definition: 'katror'
  },
  {
    command: COMMAND.SQRT,
    definition: 'rrënja_katrore'
  },
  {
    command: COMMAND.ROUND,
    definition: 'rrumbullakos'
  },
  {
    command: COMMAND.FLOOR,
    definition: 'rrumbullakos_poshtë'
  },
  {
    command: COMMAND.CEIL,
    definition: 'rrumbullakos_lart'
  },
  {
    command: COMMAND.ABS,
    definition: 'vlera_absolute'
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
