/**
 * The colors of Kotlin in CodeMirror, the entry cmil/codemirror/targets/kotlin, by the clike mode of
 * @codemirror/legacy-modes, since CodeMirror has no package of Kotlin.
 */
import {LanguageSupport, StreamLanguage} from '@codemirror/language';
import {kotlin} from '@codemirror/legacy-modes/mode/clike';

import {registerTargetLanguages, type Supports} from '../registry.ts';

const kotlinSupport = () => new LanguageSupport(StreamLanguage.define(kotlin));

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {kotlin: kotlinSupport};

registerTargetLanguages(supports);
