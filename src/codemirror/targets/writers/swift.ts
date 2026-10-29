/**
 * The colors of Swift in CodeMirror, the entry cmil/codemirror/targets/swift, by the swift mode of @codemirror/legacy-
 * modes.
 */
import {LanguageSupport, StreamLanguage} from '@codemirror/language';
import {swift} from '@codemirror/legacy-modes/mode/swift';

import {registerTargetLanguages, type Supports} from '../registry.ts';

const swiftSupport = () => new LanguageSupport(StreamLanguage.define(swift));

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {swift: swiftSupport};

registerTargetLanguages(supports);
