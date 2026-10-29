/**
 * The writer of Kotlin, the entry cmil/convert/kotlin: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/kotlin.ts';

registerWriters(WRITERS);
