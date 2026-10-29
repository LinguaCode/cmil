/**
 * The colors of Visual Basic in CodeMirror, the entry cmil/codemirror/targets/visualbasic, by the vb mode of
 * @codemirror/legacy-modes.
 */
import {LanguageSupport, StreamLanguage} from '@codemirror/language';
import {vb} from '@codemirror/legacy-modes/mode/vb';

import {registerTargetLanguages, type Supports} from '../registry.ts';

const vbSupport = () => new LanguageSupport(StreamLanguage.define(vb));

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {visualbasic: vbSupport};

registerTargetLanguages(supports);
