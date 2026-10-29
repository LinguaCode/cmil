/**
 * The colors of C++ in CodeMirror, the entry cmil/codemirror/targets/cpp, by @codemirror/lang-cpp.
 */
import {cpp} from '@codemirror/lang-cpp';

import {registerTargetLanguages, type Supports} from '../registry.ts';

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {cpp: cpp};

registerTargetLanguages(supports);
