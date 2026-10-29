/**
 * The writer of Rust, the entry cmil/convert/rust: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/rust.ts';

registerWriters(WRITERS);
