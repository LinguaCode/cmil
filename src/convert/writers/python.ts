/**
 * The writer of Python, the entry cmil/convert/python: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/python.ts';

registerWriters(WRITERS);
