/**
 * The writer of C++, the entry cmil/convert/cpp: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/cpp.ts';

registerWriters(WRITERS);
