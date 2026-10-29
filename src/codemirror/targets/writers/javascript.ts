/**
 * The colors of JavaScript in CodeMirror, the entry cmil/codemirror/targets/javascript, by @codemirror/lang-javascript.
 */
import {javascript} from '@codemirror/lang-javascript';

import {registerTargetLanguages, type Supports} from '../registry.ts';

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {javascript: javascript};

registerTargetLanguages(supports);
