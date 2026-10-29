/**
 * The writer of Pascal, the entry cmil/convert/pascal: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/pascal.ts';

registerWriters(WRITERS);
