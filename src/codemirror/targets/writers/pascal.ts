/**
 * The colors of Pascal in CodeMirror, the entry cmil/codemirror/targets/pascal, by the pascal mode of
 * @codemirror/legacy-modes.
 */
import {LanguageSupport, StreamLanguage} from '@codemirror/language';
import {pascal} from '@codemirror/legacy-modes/mode/pascal';

import {registerTargetLanguages, type Supports} from '../registry.ts';

const pascalSupport = () => new LanguageSupport(StreamLanguage.define(pascal));

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {pascal: pascalSupport};

registerTargetLanguages(supports);
