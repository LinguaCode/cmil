/**
 * The writer of Java, in its modern and its classic style, the entry cmil/convert/java: once it is imported, convert()
 * writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/java.ts';

registerWriters(WRITERS);
