/**
 * The colors of Python in CodeMirror, the entry cmil/codemirror/targets/python, by @codemirror/lang-python.
 */
import {python} from '@codemirror/lang-python';

import {registerTargetLanguages, type Supports} from '../registry.ts';

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {python: python};

registerTargetLanguages(supports);
