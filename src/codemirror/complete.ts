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

import {commandCompletionsOf, completionsAt, WORD, type Completion as CmilCompletion} from '../editing.ts';

export {namesOf} from '../editing.ts';

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

//a completion of CMIL in CodeMirror, whose types have the names of its kinds
const optionOf = ({label, kind}: CmilCompletion): Completion => ({
  label,
  type: kind,
  ...(kind === 'function' ? {apply: call(label)} : {})
});

/**
 * The completions of the commands of a language: every word of each, with its kind as its type.
 */
export const commandCompletions = (language: string): Completion[] => commandCompletionsOf(language).map(optionOf);

//Tab takes the chosen completion, and Enter always starts a new line, so a name at the end of a line stays as typed
const keys = Prec.high(
  keymap.of([...completionKeymap.filter(({key}) => key !== 'Enter'), {key: 'Tab', run: acceptCompletion}])
);

/**
 * The completions of a language's commands and of the program's names, outside texts and comments; Tab takes the
 * chosen one, and Enter starts a new line.
 */
export const cmilCompletion = (language: string): Extension => {
  return [
    keys,
    autocompletion({
      defaultKeymap: false,
      override: [
        (context: CompletionContext): CompletionResult | null => {
          const word = context.matchBefore(WORD);
          if (!word && !context.explicit) return null;

          const line = context.state.doc.lineAt(context.pos);
          const at = {line: line.number - 1, character: context.pos - line.from};
          const options = completionsAt(context.state.doc.toString(), language, at).map(optionOf);
          if (!options.length) return null;
          return {from: word ? word.from : context.pos, options, validFor: /^[\p{L}\p{M}\p{N}_]*$/u};
        }
      ]
    })
  ];
};
