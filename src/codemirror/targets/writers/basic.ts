/**
 * The colors of BASIC in CodeMirror, the entry cmil/codemirror/targets/basic, by the vb mode of @codemirror/legacy-
 * modes, with the words of FreeBASIC it hasn't.
 */
import {LanguageSupport, StreamLanguage, type StringStream} from '@codemirror/language';
import {vb} from '@codemirror/legacy-modes/mode/vb';

import {registerTargetLanguages, type Supports} from '../registry.ts';

//the words of FreeBASIC that Visual Basic hasn't
const FREEBASIC = new Set(['print', 'input', 'line', 'open', 'cons', 'randomize', 'overload', 'preserve']);

const token = (stream: StringStream, state: unknown) => {
  const style = vb.token(stream, state);
  return style === 'variable' && FREEBASIC.has(stream.current().toLowerCase()) ? 'keyword' : style;
};

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {basic: () => new LanguageSupport(StreamLanguage.define({...vb, token}))};

registerTargetLanguages(supports);
