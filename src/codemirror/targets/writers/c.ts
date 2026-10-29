/**
 * The colors of C in CodeMirror, the entry cmil/codemirror/targets/c, by @codemirror/lang-cpp, whose words it has.
 */
import {cpp} from '@codemirror/lang-cpp';

import {registerTargetLanguages, type Supports} from '../registry.ts';

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {c: cpp};

registerTargetLanguages(supports);
