/**
 * The writer of Lua, the entry cmil/convert/lua: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/lua.ts';

registerWriters(WRITERS);
