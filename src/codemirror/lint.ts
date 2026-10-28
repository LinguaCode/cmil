/**
 * Marks the first error of a program in CodeMirror while it's written, and the error it ended with when it ran; a
 * program without errors gets its warnings. The messages are in the program's language.
 */
import {linter, setDiagnostics, type Diagnostic} from '@codemirror/lint';
import type {Extension, Text} from '@codemirror/state';
import type {EditorView} from '@codemirror/view';

import {WARNING} from '../constants/index.ts';
import type {ProgramError} from '../core/types.ts';
import {segmentsOf, warningsOf, type Warning} from '../editor.ts';
import {messageOf} from '../messages.ts';
import {check} from '../session.ts';

//typing stops for this long before the program is checked
const DELAY = 300;

//where the mark of an error at an offset of a line ends: at the bracket that closes one opened before it, like the )
//of print(x), or at the end of the line
const endOf = (text: string, from: number, language: string): number => {
  let offset = 0;
  let depth = 0;
  for (const segment of segmentsOf(text, language)) {
    if (offset >= from && segment.type === 'operator') {
      if (segment.text === '(' || segment.text === '[') depth++;
      if (segment.text === ')' || segment.text === ']') {
        if (!depth && offset > from) return offset;
        depth = Math.max(depth - 1, 0);
      }
    }
    offset += segment.text.length;
  }
  return text.length;
};

/**
 * The mark of an error, from its column to the end of its value or its line, or the whole line when it has no
 * column; an error without a line, like a timeout, has none. A warning marks its text.
 */
export const diagnosticOf = (doc: Text, error: ProgramError | Warning, language: string): Diagnostic | null => {
  if (!('line' in error) || error.line < 1 || error.line > doc.lines) return null;

  const line = doc.line(error.line);
  const message = messageOf(error, language);
  if (error.id === WARNING.NUMBER_TEXT) {
    const from = line.from + error.column - 1;
    return {from, to: from + error.text.length, severity: 'warning', message};
  }

  const start = line.from + line.text.length - line.text.trimStart().length;
  const column = 'column' in error && error.column ? line.from + error.column - 1 : null;
  const at = column !== null && column < line.to;
  return {
    from: at ? column : start,
    to: at ? line.from + endOf(line.text, column - line.from, language) : line.to,
    severity: 'error',
    message
  };
};

/**
 * The first error of a program as it's written, after typing stops, or else its warnings.
 */
export const cmilLint = (language: string): Extension => [
  linter(
    view => {
      const {doc} = view.state;
      const error = check(doc.toString(), language);
      const marks = error ? [error] : warningsOf(doc.toString(), language);
      return marks.flatMap(mark => diagnosticOf(doc, mark, language) ?? []);
    },
    {delay: DELAY}
  )
];

/**
 * Marks the error a program ended with; the mark stays until the program changes.
 */
export const markError = (view: EditorView, error: ProgramError, language: string): void => {
  const diagnostic = diagnosticOf(view.state.doc, error, language);
  view.dispatch(setDiagnostics(view.state, diagnostic ? [diagnostic] : []));
};
