/**
 * The writer of JavaScript, the entry cmil/convert/javascript: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/javascript.ts';

registerWriters(WRITERS);
