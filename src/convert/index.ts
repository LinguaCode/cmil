/**
 * Converts CMIL programs into other languages, one way, the entry cmil/convert: a learner who knows a CMIL program sees
 * it in C++, Python, C#, Java, C, JavaScript, Pascal, Go, Kotlin, Swift, Rust, PHP, Ruby, Lua, BASIC, Visual Basic,
 * Fortran, Tcl, COBOL or x86-64 assembly, line by line. It's cmil/convert/core with every writer; a page that shows a
 * few languages imports the core and their writers, each cmil/convert/<writer>. The writers are given to convert() when
 * it first converts, not when the module loads, so a bundler leaves them out of a page that imports the entry cmil,
 * which has this convert(), without converting.
 */
import {convert as convertWith, type Conversion} from './core.ts';
import {registerWriters} from './registry.ts';
import {WRITERS as cpp} from './targets/cpp.ts';
import {WRITERS as python} from './targets/python.ts';
import {WRITERS as csharp} from './targets/csharp.ts';
import {WRITERS as java} from './targets/java.ts';
import {WRITERS as c} from './targets/c.ts';
import {WRITERS as javascript} from './targets/javascript.ts';
import {WRITERS as pascal} from './targets/pascal.ts';
import {WRITERS as go} from './targets/go.ts';
import {WRITERS as kotlin} from './targets/kotlin.ts';
import {WRITERS as swift} from './targets/swift.ts';
import {WRITERS as rust} from './targets/rust.ts';
import {WRITERS as php} from './targets/php.ts';
import {WRITERS as ruby} from './targets/ruby.ts';
import {WRITERS as lua} from './targets/lua.ts';
import {WRITERS as basic} from './targets/basic.ts';
import {WRITERS as visualbasic} from './targets/visualbasic.ts';
import {WRITERS as fortran} from './targets/fortran.ts';
import {WRITERS as tcl} from './targets/tcl.ts';
import {WRITERS as cobol} from './targets/cobol.ts';
import {WRITERS as assembly} from './targets/assembly/index.ts';

export {targets} from './core.ts';
export type {Conversion, ConversionProblem, Target, TargetId, WriterId} from './core.ts';

let registered = false;

/**
 * Converts a program into a language of targets: its code, with the CMIL line each line comes from; or why it can't
 * be, like a variable with a number and a text in C++; or the error the program has before it runs.
 */
export const convert = (sourceCode: string, language: string, target: string): Conversion => {
  if (!registered) {
    registerWriters({
      ...cpp,
      ...python,
      ...csharp,
      ...java,
      ...c,
      ...javascript,
      ...pascal,
      ...go,
      ...kotlin,
      ...swift,
      ...rust,
      ...php,
      ...ruby,
      ...lua,
      ...basic,
      ...visualbasic,
      ...fortran,
      ...tcl,
      ...cobol,
      ...assembly
    });
    registered = true;
  }
  return convertWith(sourceCode, language, target);
};
