/**
 * The colors of Ruby in CodeMirror, the entry cmil/codemirror/targets/ruby, by the ruby mode of @codemirror/legacy-
 * modes.
 */
import {LanguageSupport, StreamLanguage} from '@codemirror/language';
import {ruby} from '@codemirror/legacy-modes/mode/ruby';

import {registerTargetLanguages, type Supports} from '../registry.ts';

const rubySupport = () => new LanguageSupport(StreamLanguage.define(ruby));

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {ruby: rubySupport};

registerTargetLanguages(supports);
