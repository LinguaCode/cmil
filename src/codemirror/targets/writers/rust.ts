/**
 * The colors of Rust in CodeMirror, the entry cmil/codemirror/targets/rust, by @codemirror/lang-rust.
 */
import {rust} from '@codemirror/lang-rust';

import {registerTargetLanguages, type Supports} from '../registry.ts';

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {rust: rust};

registerTargetLanguages(supports);
