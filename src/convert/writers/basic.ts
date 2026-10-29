/**
 * The writer of BASIC, the entry cmil/convert/basic: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/basic.ts';

registerWriters(WRITERS);
