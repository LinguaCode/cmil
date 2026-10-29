/**
 * The colors of C#, in both its styles, in CodeMirror, the entry cmil/codemirror/targets/csharp, by the clike mode of
 * @codemirror/legacy-modes, since CodeMirror has no package of C#.
 */
import {LanguageSupport, StreamLanguage} from '@codemirror/language';
import {csharp} from '@codemirror/legacy-modes/mode/clike';

import {registerTargetLanguages, type Supports} from '../registry.ts';

const csharpSupport = () => new LanguageSupport(StreamLanguage.define(csharp));

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {csharp: csharpSupport, 'csharp-classic': csharpSupport};

registerTargetLanguages(supports);
