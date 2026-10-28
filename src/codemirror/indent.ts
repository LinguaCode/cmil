/**
 * The indentation of CMIL programs in CodeMirror: 4 spaces, one level more after a line that starts a block, like if
 * or repeat.
 */
import {indentService, indentUnit} from '@codemirror/language';
import type {Extension} from '@codemirror/state';

import {segmentsOf} from '../editor.ts';
import {kindsOf} from './language.ts';

/** The spaces of one level of indentation, which CMIL takes. */
export const INDENT = 4;

const indentOf = (line: string) => line.length - line.trimStart().length;

//the command a line starts with, if it starts with one
const firstCommand = (line: string, language: string) => {
  const first = segmentsOf(line, language).find(({type}) => type !== 'space');
  return first?.type === 'keyword' ? first.command : undefined;
};

//whether the while at the end of lines ends a do … while: the line above it at its indentation is a do
const endsDo = (lines: string[], indent: number, language: string) => {
  for (let i = lines.length - 2; i >= 0; i--) {
    const other = indentOf(lines[i]);
    if (other < indent) return false;
    if (other === indent) return firstCommand(lines[i], language) === 'do';
  }
  return false;
};

/**
 * The indentation, in spaces, of a line after the lines before it:
 * - an else goes back to the nearest if or else that isn't indented more than it, and never goes right;
 * - after a line that starts a block, one level more than that line, except after the while that ends do … while;
 * - else, as the last line that isn't empty.
 */
export const indentationOf = (before: string[], line: string, language: string): number => {
  const lines = before.filter(text => text.trim());

  if (firstCommand(line, language) === 'else') {
    const indent = indentOf(line);
    const match = lines.findLast(text => {
      const command = firstCommand(text, language);
      return (command === 'if' || command === 'else') && indentOf(text) <= indent;
    });
    return match === undefined ? indent : indentOf(match);
  }

  const last = lines.at(-1);
  if (last === undefined) return 0;

  const indent = indentOf(last);
  const command = firstCommand(last, language);
  if (!command || kindsOf(language).get(command) !== 'block') return indent;
  if (command === 'while' && endsDo(lines, indent, language)) return indent;
  return indent + INDENT;
};

/** The indentation of a language's programs, with an indent unit of 4 spaces. */
export const cmilIndent = (language: string): Extension => [
  indentUnit.of(' '.repeat(INDENT)),
  indentService.of((context, pos) => {
    //the line to indent, which may be a new one after Enter, and the lines before it
    const line = context.lineAt(pos, 1);
    const before: string[] = [];
    for (let above = line; above.from > 0;) {
      above = context.lineAt(above.from - 1, -1);
      before.unshift(above.text);
    }
    return indentationOf(before, line.text, language);
  })
];
