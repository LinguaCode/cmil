/**
 * The writer of Tcl, the entry cmil/convert/tcl: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/tcl.ts';

registerWriters(WRITERS);
