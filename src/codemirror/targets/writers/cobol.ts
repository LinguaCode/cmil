/**
 * The colors of COBOL in CodeMirror, the entry cmil/codemirror/targets/cobol, by the cobol mode of @codemirror/legacy-
 * modes, which reads the fixed format, in GnuCOBOL's free format, which CMIL writes: a comment starts with *>, and each
 * word is read as it would be in the 8th column, since the mode takes the first 6 columns for the numbers of the lines
 * and those from the 73rd for a tag.
 */
import {LanguageSupport, StreamLanguage, StringStream} from '@codemirror/language';
import {cobol} from '@codemirror/legacy-modes/mode/cobol';

import {registerTargetLanguages, type Supports} from '../registry.ts';

//the column where a word of COBOL in its fixed format starts, from 0
const FIXED = 7;

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

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {cobol: () => new LanguageSupport(StreamLanguage.define({...cobol, token}))};

registerTargetLanguages(supports);
