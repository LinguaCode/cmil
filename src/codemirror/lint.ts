/**
 * Marks the first error of a program in CodeMirror while it's written, and the error it ended with when it ran; a
 * program without errors gets its warnings. The messages are in the program's language.
 */
import {linter, setDiagnostics, type Diagnostic} from '@codemirror/lint';
import type {Extension, Text} from '@codemirror/state';
import type {EditorView} from '@codemirror/view';

import type {ProgramError} from '../core/types.ts';
import type {Warning} from '../editor.ts';
import {problemOfError, problemsOf, type Problem} from '../editing.ts';

//typing stops for this long before the program is checked
const DELAY = 300;

//the mark of a problem, from its places to offsets of the document
const diagnosticOfProblem = (doc: Text, {from, to, severity, message}: Problem): Diagnostic => ({
  from: doc.line(from.line + 1).from + from.character,
  to: doc.line(to.line + 1).from + to.character,
  severity,
  message
});

/**
 * The mark of an error, from its column to the end of its value or its line, or the whole line when it has no
 * column; an error without a line, like a timeout, has none. A warning marks its text. It's the range of
 * problemOfError(), as a language server marks it.
 */
export const diagnosticOf = (doc: Text, error: ProgramError | Warning, language: string): Diagnostic | null => {
  const problem = problemOfError(doc.toString(), error, language);
  return problem && diagnosticOfProblem(doc, problem);
};

/**
 * The first error of a program as it's written, after typing stops, or else its warnings: problemsOf().
 */
export const cmilLint = (language: string): Extension => [
  linter(
    view => {
      const {doc} = view.state;
      return problemsOf(doc.toString(), language).map(problem => diagnosticOfProblem(doc, problem));
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
