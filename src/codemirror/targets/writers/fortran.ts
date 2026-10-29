/**
 * The colors of Fortran in CodeMirror, the entry cmil/codemirror/targets/fortran, by the fortran mode of
 * @codemirror/legacy-modes.
 */
import {LanguageSupport, StreamLanguage} from '@codemirror/language';
import {fortran} from '@codemirror/legacy-modes/mode/fortran';

import {registerTargetLanguages, type Supports} from '../registry.ts';

const fortranSupport = () => new LanguageSupport(StreamLanguage.define(fortran));

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {fortran: fortranSupport};

registerTargetLanguages(supports);
