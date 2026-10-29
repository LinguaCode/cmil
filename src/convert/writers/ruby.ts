/**
 * The writer of Ruby, the entry cmil/convert/ruby: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/ruby.ts';

registerWriters(WRITERS);
