/**
 * The writer of Visual Basic, the entry cmil/convert/visualbasic: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/visualbasic.ts';

registerWriters(WRITERS);
