/**
 * The colors of the languages programs are converted into, in CodeMirror, the entry cmil/codemirror/targets: a word,
 * a text or a number of C++ gets the class of the same kind in CMIL, like cmil-string. Each language's package is
 * loaded when it is first shown, and C# and Kotlin, which CodeMirror has no packages of, are colored by its modes of
 * the languages like C, Pascal, Swift, Ruby and Lua by their modes, as are Visual Basic, Fortran, Tcl, COBOL and
 * x86-64 assembly of the GNU assembler, NASM by a mode of its own, and BASIC by the mode of Visual Basic, with the
 * words of FreeBASIC it hasn't. The packages are peer dependencies of CMIL: @codemirror/lang-cpp, -go, -java,
 * -javascript, -php, -python and -rust, and @codemirror/legacy-modes.
 */
import {
  LanguageSupport,
  StreamLanguage,
  StringStream,
  syntaxHighlighting,
  type StreamParser
} from '@codemirror/language';
import type {Extension} from '@codemirror/state';
import {tagHighlighter, tags} from '@lezer/highlight';

import {targets} from '../targets.ts';
import type {ColorOptions} from './language.ts';

export type {ColorOptions} from './language.ts';

const highlighter = tagHighlighter([
  {tag: [tags.controlKeyword, tags.processingInstruction], class: 'cmil-block'},
  {tag: [tags.keyword, tags.definitionKeyword, tags.modifier], class: 'cmil-statement'},
  {tag: [tags.typeName, tags.namespace, tags.className], class: 'cmil-part'},
  {tag: [tags.operatorKeyword, tags.logicOperator], class: 'cmil-operator'},
  {tag: [tags.bool, tags.null, tags.atom, tags.self], class: 'cmil-value'},
  {tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], class: 'cmil-function'},
  {tag: [tags.string, tags.character, tags.special(tags.string)], class: 'cmil-string'},
  {tag: tags.number, class: 'cmil-number'},
  {tag: [tags.comment, tags.lineComment, tags.blockComment], class: 'cmil-comment'},
  {tag: [tags.operator, tags.punctuation, tags.bracket], class: 'cmil-symbol'}
]);

//the words of FreeBASIC that Visual Basic hasn't, which BASIC is colored with too
const FREEBASIC = new Set(['print', 'input', 'line', 'open', 'cons', 'randomize', 'overload', 'preserve']);

//the sizes of the values of x86-64 assembly in Intel syntax, like qword ptr, its registers, and the instructions
//that go to a label
const SIZES = new Set(['byte', 'word', 'dword', 'qword', 'ptr']);
const REGISTER = /^(r?[a-d]x|e[a-d]x|[a-d][lh]|[re]?(si|di|sp|bp|ip)|(si|di|sp|bp)l|r\d+[dwbl]?|xmm\d+)$/;
const JUMP = /^(call|j[a-z]+)$/;

//the column where a word of COBOL in its fixed format starts, from 0
const FIXED = 7;

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

//by the extension of a target's files, which both shapes of C# and of Java have
const LOADERS: Record<string, () => Promise<LanguageSupport>> = {
  cpp: async () => (await import('@codemirror/lang-cpp')).cpp(),
  //C is colored by the package of C++, whose words it has
  c: async () => (await import('@codemirror/lang-cpp')).cpp(),
  py: async () => (await import('@codemirror/lang-python')).python(),
  java: async () => (await import('@codemirror/lang-java')).java(),
  js: async () => (await import('@codemirror/lang-javascript')).javascript(),
  go: async () => (await import('@codemirror/lang-go')).go(),
  rs: async () => (await import('@codemirror/lang-rust')).rust(),
  php: async () => (await import('@codemirror/lang-php')).php(),
  pas: async () =>
    new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/pascal')).pascal)),
  cs: async () =>
    new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/clike')).csharp)),
  kt: async () =>
    new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/clike')).kotlin)),
  swift: async () =>
    new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/swift')).swift)),
  rb: async () => new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/ruby')).ruby)),
  lua: async () => new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/lua')).lua)),
  vb: async () => new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/vb')).vb)),
  f90: async () =>
    new LanguageSupport(StreamLanguage.define((await import('@codemirror/legacy-modes/mode/fortran')).fortran)),
  //Tcl's, which gives a text outside the brackets of a call only its opening quote, and an operator, the color of a
  //comment: the text goes to its closing quote, which isn't escaped, and an operator has the color of one
  tcl: async () => {
    const {tcl} = await import('@codemirror/legacy-modes/mode/tcl');
    const token = (stream: StringStream, state: unknown) => {
      const style = tcl.token(stream, state);
      if (style !== 'comment' || stream.current().startsWith('#')) return style;
      if (stream.current() !== '"') return 'operator';
      for (let escaped = false, next; (next = stream.next()) !== undefined;) {
        if (next === '"' && !escaped) break;
        escaped = !escaped && next === '\\';
      }
      return 'string';
    };
    return new LanguageSupport(StreamLanguage.define({...tcl, token}));
  },
  //COBOL's, which reads the fixed format, in GnuCOBOL's free format, which CMIL writes: a comment starts with *>, and
  //each word is read as it would be in the 8th column, since the mode takes the first 6 columns for the numbers of
  //the lines and those from the 73rd for a tag
  cob: async () => {
    const {cobol} = await import('@codemirror/legacy-modes/mode/cobol');
    const token = (stream: StringStream, state: unknown) => {
      if (stream.match('*>')) {
        stream.skipToEnd();
        return 'comment';
      }
      const shifted = new StringStream(`${' '.repeat(FIXED)}${stream.string.slice(stream.pos)}`, 4, 4);
      shifted.pos = shifted.start = FIXED;
      const style = cobol.token(shifted, state);
      stream.pos += shifted.pos - FIXED;
      return style;
    };
    return new LanguageSupport(StreamLanguage.define({...cobol, token}));
  },
  //the GNU assembler's, of x86, with the colors it doesn't give: the instruction, the first word of its line, a
  //directive, like .text, a label and the label a call or a jump goes to, a register, and the size of a value
  s: async () => {
    const {gas} = await import('@codemirror/legacy-modes/mode/gas');
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
    return new LanguageSupport(StreamLanguage.define({...gas, token}));
  },
  asm: async () => new LanguageSupport(StreamLanguage.define(nasm)),
  bas: async () => {
    const {vb} = await import('@codemirror/legacy-modes/mode/vb');
    const token = (stream: StringStream, state: unknown) => {
      const style = vb.token(stream, state);
      return style === 'variable' && FREEBASIC.has(stream.current().toLowerCase()) ? 'keyword' : style;
    };
    return new LanguageSupport(StreamLanguage.define({...vb, token}));
  }
};

/**
 * The colors of a target of convert(), like cpp, with the classes of CMIL's tokens unless classes is false, once its
 * package is loaded; an unknown target throws an error.
 *
 * @example
 * new EditorView({doc: convert(code, 'en', 'cpp').code, extensions: await targetLanguage('cpp'), parent});
 */
export const targetLanguage = async (target: string, options?: ColorOptions): Promise<Extension> => {
  const extension = targets.find(({id}) => id === target)?.extension;
  if (extension === undefined) throw new Error(`Unknown target: ${target}`);
  const support = await LOADERS[extension]();
  return options?.classes === false ? support : [support, syntaxHighlighting(highlighter)];
};
