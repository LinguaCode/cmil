/**
 * The colors of the languages programs are converted into, in CodeMirror, the entry cmil/codemirror/targets/core: a
 * word, a text or a number of C++ gets the class of the same kind in CMIL, like cmil-string. targetLanguage() colors
 * a target once its colors are imported, the entry cmil/codemirror/targets/<writer> of targets[].writer, like
 * cmil/codemirror/targets/cpp; cmil/codemirror/targets has the colors of every target.
 */
import {syntaxHighlighting} from '@codemirror/language';
import type {Extension} from '@codemirror/state';
import {tagHighlighter, tags} from '@lezer/highlight';

import {targets} from '../../targets.ts';
import type {ColorOptions} from '../language.ts';
import {supportOf} from './registry.ts';

export type {ColorOptions} from '../language.ts';

const highlighter = tagHighlighter([
  {tag: [tags.controlKeyword, tags.processingInstruction], class: 'cmil-block'},
  {tag: [tags.keyword, tags.definitionKeyword, tags.modifier], class: 'cmil-statement'},
  {tag: [tags.typeName, tags.namespace, tags.className], class: 'cmil-part'},
  {tag: [tags.operatorKeyword, tags.logicOperator], class: 'cmil-operator'},
  {tag: [tags.bool, tags.null, tags.atom, tags.self], class: 'cmil-value'},
  {tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], class: 'cmil-function'},
  {tag: [tags.string, tags.character, tags.special(tags.string)], class: 'cmil-string'},
  {tag: tags.number, class: 'cmil-number'},
  {tag: [tags.comment, tags.lineComment, tags.blockComment], class: 'cmil-comment'},
  {tag: [tags.operator, tags.punctuation, tags.bracket], class: 'cmil-symbol'}
]);

/**
 * The colors of a target of convert(), like cpp, with the classes of CMIL's tokens unless classes is false; an
 * unknown target, or one whose colors aren't imported, throws an error.
 *
 * @example
 * new EditorView({doc: convert(code, 'en', 'cpp').code, extensions: await targetLanguage('cpp'), parent});
 */
export const targetLanguage = async (target: string, options?: ColorOptions): Promise<Extension> => {
  const known = targets.find(({id}) => id === target);
  if (!known) throw new Error(`Unknown target: ${target}`);
  const load = supportOf(target);
  if (!load) throw new Error(`The colors of ${target} aren't loaded: import cmil/codemirror/targets/${known.writer}`);
  const support = await load();
  return options?.classes === false ? support : [support, syntaxHighlighting(highlighter)];
};
