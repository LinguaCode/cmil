/**
 * The writer of x86-64 assembly, in the intel and att syntaxes of the GNU assembler and in NASM's, the entry
 * cmil/convert/assembly: once it is imported, convert() writes programs in it.
 */
import {registerWriters} from '../registry.ts';
import {WRITERS} from '../targets/assembly/index.ts';

registerWriters(WRITERS);
