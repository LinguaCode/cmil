/**
 * The writer of C#, in its modern and its classic style, the entry cmil/convert/csharp: once it is imported, convert()
 * writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/csharp.ts';

registerWriters(WRITERS);
