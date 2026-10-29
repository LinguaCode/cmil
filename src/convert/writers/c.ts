/**
 * The writer of C, the entry cmil/convert/c: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/c.ts';

registerWriters(WRITERS);
