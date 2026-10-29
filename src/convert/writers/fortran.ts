/**
 * The writer of Fortran, the entry cmil/convert/fortran: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/fortran.ts';

registerWriters(WRITERS);
