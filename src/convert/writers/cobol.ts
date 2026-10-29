/**
 * The writer of COBOL, the entry cmil/convert/cobol: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/cobol.ts';

registerWriters(WRITERS);
