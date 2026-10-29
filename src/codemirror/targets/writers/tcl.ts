/**
 * The colors of Tcl in CodeMirror, the entry cmil/codemirror/targets/tcl, by the tcl mode of @codemirror/legacy-modes,
 * which gives a text outside the brackets of a call only its opening quote, and an operator, the color of a comment:
 * the text goes to its closing quote, which isn't escaped, and an operator has the color of one.
 */
import {LanguageSupport, StreamLanguage, type StringStream} from '@codemirror/language';
import {tcl} from '@codemirror/legacy-modes/mode/tcl';

import {registerTargetLanguages, type Supports} from '../registry.ts';

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

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {tcl: () => new LanguageSupport(StreamLanguage.define({...tcl, token}))};

registerTargetLanguages(supports);
