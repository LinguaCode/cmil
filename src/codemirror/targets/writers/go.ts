/**
 * The colors of Go in CodeMirror, the entry cmil/codemirror/targets/go, by @codemirror/lang-go.
 */
import {go} from '@codemirror/lang-go';

import {registerTargetLanguages, type Supports} from '../registry.ts';

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {go: go};

registerTargetLanguages(supports);
