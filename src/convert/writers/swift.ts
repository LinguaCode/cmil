/**
 * The writer of Swift, the entry cmil/convert/swift: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/swift.ts';

registerWriters(WRITERS);
