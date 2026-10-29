/**
 * The colors of PHP in CodeMirror, the entry cmil/codemirror/targets/php, by @codemirror/lang-php.
 */
import {php} from '@codemirror/lang-php';

import {registerTargetLanguages, type Supports} from '../registry.ts';

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {php: php};

registerTargetLanguages(supports);
