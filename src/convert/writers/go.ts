/**
 * The writer of Go, the entry cmil/convert/go: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/go.ts';

registerWriters(WRITERS);
