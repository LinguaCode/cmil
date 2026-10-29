/**
 * The colors of x86-64 assembly in CodeMirror, the entry cmil/codemirror/targets/assembly: the intel and att syntaxes
 * of the GNU assembler by the gas mode of @codemirror/legacy-modes, and NASM by a mode of its own.
 */
import {LanguageSupport, StreamLanguage, type StreamParser, type StringStream} from '@codemirror/language';
import {gas} from '@codemirror/legacy-modes/mode/gas';

import {registerTargetLanguages, type Supports} from '../registry.ts';

//the sizes of the values of x86-64 assembly in Intel syntax, like qword ptr, its registers, and the instructions
//that go to a label
const SIZES = new Set(['byte', 'word', 'dword', 'qword', 'ptr']);
const REGISTER = /^(r?[a-d]x|e[a-d]x|[a-d][lh]|[re]?(si|di|sp|bp|ip)|(si|di|sp|bp)l|r\d+[dwbl]?|xmm\d+)$/;
const JUMP = /^(call|j[a-z]+)$/;

//the words of NASM's directives
const NASM_DIRECTIVES = new Set(['section', 'global', 'extern', 'equ', 'db', 'dq', 'align', 'rel', 'wrt']);

//NASM, which CodeMirror has no mode of, in the colors x86-64 assembly of the GNU assembler has: an instruction, a
//directive, a label and the label a call or a jump goes to, a register, the size of a value, a text and a comment
const nasm: StreamParser<unknown> = {
  name: 'nasm',
  token: stream => {
    if (stream.eatSpace()) return null;
    const before = stream.string.slice(0, stream.pos).trim();
    if (stream.eat(';')) {
      stream.skipToEnd();
      return 'comment';
    }
    if (stream.match(/^`(?:[^`\\]|\\.)*`/)) return 'string';
    if (stream.match(/^-?(0x[0-9a-f]+|\d+(\.\d+)?(e[+-]?\d+)?)/i)) return 'number';
    if (!stream.match(/^[\p{L}\p{N}_.@$?~#]+/u)) {
      stream.next();
      return null;
    }
    const word = stream.current().toLowerCase();
    if (stream.eat(':') || word.startsWith('data.') || (JUMP.test(before) && word.startsWith('.'))) {
      return 'variableName.function';
    }
    if (NASM_DIRECTIVES.has(word)) return 'processingInstruction';
    if (SIZES.has(word)) return 'typeName';
    if (REGISTER.test(word)) return 'atom';
    //a variable, like .total, which equ names at the start of its line
    if (word.startsWith('.')) return null;
    if (!before) return 'keyword';
    return JUMP.test(before) ? 'variableName.function' : null;
  }
};

//the GNU assembler's, of x86, with the colors it doesn't give: the instruction, the first word of its line, a
//directive, like .text, a label and the label a call or a jump goes to, a register, and the size of a value
const token = (stream: StringStream, state: unknown) => {
  const before = stream.string.slice(0, stream.pos).trim();
  const style = gas.token(stream, state);
  const word = stream.current().toLowerCase();
  if (style === 'variable' || style === 'variableName.special') return 'atom';
  if (style === 'tag' || word.startsWith('.l')) return 'variableName.function';
  if (style === 'builtin' || (!style && /^\.\w+$/.test(word))) return 'processingInstruction';
  if (style || !/^\w+$/.test(word)) return style;
  if (SIZES.has(word)) return 'typeName';
  if (!before) return 'keyword';
  return JUMP.test(before) ? 'variableName.function' : style;
};

const gnu = () => new LanguageSupport(StreamLanguage.define({...gas, token}));

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {
  'x86-64': gnu,
  'x86-64-att': gnu,
  'x86-64-nasm': () => new LanguageSupport(StreamLanguage.define(nasm))
};

registerTargetLanguages(supports);
