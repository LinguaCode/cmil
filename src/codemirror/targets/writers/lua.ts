/**
 * The colors of Lua in CodeMirror, the entry cmil/codemirror/targets/lua, by the lua mode of @codemirror/legacy-modes.
 */
import {LanguageSupport, StreamLanguage} from '@codemirror/language';
import {lua} from '@codemirror/legacy-modes/mode/lua';

import {registerTargetLanguages, type Supports} from '../registry.ts';

const luaSupport = () => new LanguageSupport(StreamLanguage.define(lua));

/** The CodeMirror language of each of its targets, which targetLanguage() colors once this is imported. */
export const supports: Supports = {lua: luaSupport};

registerTargetLanguages(supports);
