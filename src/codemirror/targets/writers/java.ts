/**
 * The colors of Java, in both its styles, in CodeMirror, the entry cmil/codemirror/targets/java, by @codemirror/lang-
 * java.
 */
import {java} from '@codemirror/lang-java';

import {registerTargetLanguages, type Supports} from '../registry.ts';

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {java: java, 'java-classic': java};

registerTargetLanguages(supports);
