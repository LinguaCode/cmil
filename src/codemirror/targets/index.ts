/**
 * The colors of the languages programs are converted into, in CodeMirror, the entry cmil/codemirror/targets: a word, a
 * text or a number of C++ gets the class of the same kind in CMIL, like cmil-string. It's cmil/codemirror/targets/core
 * with the colors of every target, each loaded when it is first shown: C# and Kotlin, which CodeMirror has no packages
 * of, are colored by its modes of the languages like C, Pascal, Swift, Ruby and Lua by their modes, as are Visual
 * Basic, Fortran, Tcl, COBOL and x86-64 assembly of the GNU assembler, NASM by a mode of its own, and BASIC by the mode
 * of Visual Basic, with the words of FreeBASIC it hasn't. The packages are peer dependencies of CMIL:
 * @codemirror/lang-cpp, -go, -java, -javascript, -php, -python and -rust, and @codemirror/legacy-modes. The loaders are
 * given to targetLanguage() when it first colors a target, not when the module loads, so a bundler leaves out what a
 * page doesn't use.
 */
import type {Extension} from '@codemirror/state';

import {targets, type TargetId, type WriterId} from '../../targets.ts';
import {targetLanguage as colorsOf, type ColorOptions} from './core.ts';
import {registerTargetLanguages, supportOf, type Supports} from './registry.ts';

export type {ColorOptions} from './core.ts';

const PARTS: Record<WriterId, () => Promise<{supports: Supports}>> = {
  cpp: () => import('./writers/cpp.ts'),
  python: () => import('./writers/python.ts'),
  csharp: () => import('./writers/csharp.ts'),
  java: () => import('./writers/java.ts'),
  c: () => import('./writers/c.ts'),
  javascript: () => import('./writers/javascript.ts'),
  pascal: () => import('./writers/pascal.ts'),
  go: () => import('./writers/go.ts'),
  kotlin: () => import('./writers/kotlin.ts'),
  swift: () => import('./writers/swift.ts'),
  rust: () => import('./writers/rust.ts'),
  php: () => import('./writers/php.ts'),
  ruby: () => import('./writers/ruby.ts'),
  lua: () => import('./writers/lua.ts'),
  basic: () => import('./writers/basic.ts'),
  visualbasic: () => import('./writers/visualbasic.ts'),
  fortran: () => import('./writers/fortran.ts'),
  tcl: () => import('./writers/tcl.ts'),
  cobol: () => import('./writers/cobol.ts'),
  assembly: () => import('./writers/assembly.ts')
};

let registered = false;

/**
 * The colors of a target of convert(), like cpp, with the classes of CMIL's tokens unless classes is false, once its
 * package is loaded, when it is first shown; an unknown target throws an error.
 *
 * @example
 * new EditorView({doc: convert(code, 'en', 'cpp').code, extensions: await targetLanguage('cpp'), parent});
 */
export const targetLanguage = (target: string, options?: ColorOptions): Promise<Extension> => {
  if (!registered) {
    //each target loads the colors of its writer, unless they are imported already
    registerTargetLanguages(
      Object.fromEntries(
        targets
          .filter(({id}) => !supportOf(id))
          .map(({id, writer}) => [id, async () => (await PARTS[writer as WriterId]()).supports[id as TargetId]!()])
      )
    );
    registered = true;
  }
  return colorsOf(target, options);
};
