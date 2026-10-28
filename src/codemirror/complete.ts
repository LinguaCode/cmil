/**
 * Completes the words of the language's commands and the names of the program as they are typed in CodeMirror.
 */
import {
  acceptCompletion,
  autocompletion,
  completionKeymap,
  pickedCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult
} from '@codemirror/autocomplete';
import {Prec, type Extension} from '@codemirror/state';
import {keymap, type EditorView} from '@codemirror/view';

import {commandsOf, segmentsOf, type CommandKind} from '../editor.ts';
import {insideText} from './quotes.ts';

const WORD = /[\p{L}\p{M}\p{N}_]+/u;

const TYPES: Record<CommandKind, string> = {
  block: 'keyword',
  statement: 'keyword',
  part: 'keyword',
  operator: 'keyword',
  value: 'constant',
  function: 'function'
};

//a function is completed with its brackets, with the cursor between them
const call =
  (word: string) =>
  (view: EditorView, completion: Completion, from: number, to: number): void => {
    view.dispatch({
      changes: {from, to, insert: `${word}()`},
      selection: {anchor: from + word.length + 1},
      annotations: pickedCompletion.of(completion),
      userEvent: 'input.complete'
    });
  };

/**
 * The completions of the commands of a language: every word of each, with its kind as its type.
 */
export const commandCompletions = (language: string): Completion[] =>
  commandsOf(language).flatMap(({words, kind}) =>
    words.map(word => ({label: word, type: TYPES[kind], ...(kind === 'function' ? {apply: call(word)} : {})}))
  );

/**
 * The names in a program, without the one being typed.
 */
export const namesOf = (lines: Iterable<string>, language: string, typed = ''): string[] => {
  const names = new Set<string>();
  for (const line of lines) {
    segmentsOf(line, language).forEach(({type, text}) => type === 'name' && names.add(text));
  }
  names.delete(typed);
  return [...names];
};

//Tab takes the chosen completion, and Enter always starts a new line, so a name at the end of a line stays as typed
const keys = Prec.high(
  keymap.of([...completionKeymap.filter(({key}) => key !== 'Enter'), {key: 'Tab', run: acceptCompletion}])
);

/**
 * The completions of a language's commands and of the program's names, outside texts and comments; Tab takes the
 * chosen one, and Enter starts a new line.
 */
export const cmilCompletion = (language: string): Extension => {
  const commands = commandCompletions(language);

  return [
    keys,
    autocompletion({
      defaultKeymap: false,
      override: [
        (context: CompletionContext): CompletionResult | null => {
          const word = context.matchBefore(WORD);
          if (!word && !context.explicit) return null;

          const from = word ? word.from : context.pos;
          const line = context.state.doc.lineAt(from);
          if (insideText(line.text.slice(0, from - line.from), language)) return null;

          const names = namesOf(context.state.doc.iterLines(), language, word?.text).map(label => ({
            label,
            type: 'variable'
          }));
          return {from, options: [...commands, ...names], validFor: /^[\p{L}\p{M}\p{N}_]*$/u};
        }
      ]
    })
  ];
};
