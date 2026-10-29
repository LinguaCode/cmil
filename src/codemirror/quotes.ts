/**
 * Closes the quotes of the language as they are typed in CodeMirror, also with an input method: „ adds “ in German,
 * and 「 adds 」 in Japanese.
 */
import {EditorSelection, Prec, type EditorState, type Extension, type Transaction} from '@codemirror/state';
import {EditorView, keymap} from '@codemirror/view';

import {quotesOf} from '../editor.ts';
import {insideText} from '../editing.ts';

//the closing quote is added before a space, a bracket that closes, a comma or the end of the line
const CLOSE_BEFORE = /^$|^[\s)\],]/;

/**
 * What typing a character at the selection does with the quotes of a language: a transaction, or null to type it
 * as it is. An opening quote adds its closing quote, or wraps the selected text; a closing quote that is already
 * there after the cursor is stepped over.
 */
export const typeQuote = (state: EditorState, text: string, language: string): Transaction | null => {
  const range = state.selection.main;
  if (state.selection.ranges.length > 1 || text.length !== 1) return null;

  const line = state.doc.lineAt(range.from);
  const inside = insideText(line.text.slice(0, range.from - line.from), language);
  const next = state.sliceDoc(range.to, range.to + 1);
  const quotes = new Map(quotesOf(language));

  if (inside && range.empty && next === text && [...quotes.values()].includes(text)) {
    return state.update({selection: {anchor: range.to + 1}, scrollIntoView: true, userEvent: 'input.type'});
  }

  const close = quotes.get(text);
  if (close === undefined || inside || (range.empty && !CLOSE_BEFORE.test(next))) return null;

  return state.update({
    changes: [
      {from: range.from, insert: text},
      {from: range.to, insert: close}
    ],
    selection: EditorSelection.single(range.from + 1, range.to + 1),
    scrollIntoView: true,
    userEvent: 'input.type'
  });
};

/**
 * After a composition, like that of an input method, which typed an opening quote before the cursor: the transaction
 * that adds its closing quote after the cursor, under the same rule as typeQuote(), or null.
 */
export const closeComposed = (state: EditorState, text: string, language: string): Transaction | null => {
  const range = state.selection.main;
  const close = new Map(quotesOf(language)).get(text);
  if (close === undefined || state.selection.ranges.length > 1 || !range.empty) return null;
  if (state.sliceDoc(range.from - text.length, range.from) !== text) return null;

  const line = state.doc.lineAt(range.from);
  if (insideText(line.text.slice(0, range.from - text.length - line.from), language)) return null;
  if (!CLOSE_BEFORE.test(state.sliceDoc(range.from, range.from + 1))) return null;

  return state.update({
    changes: {from: range.from, insert: close},
    selection: {anchor: range.from},
    userEvent: 'input.type'
  });
};

//Backspace between two quotes that make a pair deletes both
const deletePair = (language: string) => (view: EditorView) => {
  const {state} = view;
  const range = state.selection.main;
  if (state.selection.ranges.length > 1 || !range.empty || range.from === 0) return false;

  const open = state.sliceDoc(range.from - 1, range.from);
  const close = new Map(quotesOf(language)).get(open);
  if (close === undefined || state.sliceDoc(range.from, range.from + 1) !== close) return false;

  view.dispatch({changes: {from: range.from - 1, to: range.from + 1}, userEvent: 'delete.backward'});
  return true;
};

/**
 * The quotes of a language as they are typed: an opening quote adds its closing one, also after an input method,
 * a closing quote steps over the one after the cursor, and Backspace between a pair deletes both.
 */
export const closeQuotes = (language: string): Extension => [
  EditorView.inputHandler.of((view, from, to, text) => {
    if (view.composing || from !== view.state.selection.main.from || to !== view.state.selection.main.to) return false;
    const transaction = typeQuote(view.state, text, language);
    if (!transaction) return false;
    view.dispatch(transaction);
    return true;
  }),
  //an input method types its text in a composition, which the input handler leaves as it is
  EditorView.domEventHandlers({
    //right after the event, when CodeMirror has the text of the composition, and before the next key
    compositionend: ({data}: {data: string}, view) => {
      queueMicrotask(() => {
        const transaction = closeComposed(view.state, data, language);
        if (transaction) view.dispatch(transaction);
      });
      return false;
    }
  }),
  Prec.high(keymap.of([{key: 'Backspace', run: deletePair(language)}]))
];
