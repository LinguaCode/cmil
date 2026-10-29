/**
 * The writer of PHP, the entry cmil/convert/php: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/php.ts';

registerWriters(WRITERS);
