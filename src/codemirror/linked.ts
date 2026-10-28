/**
 * The lines of one CodeMirror editor that go with the line of the cursor in another: a CMIL line and the lines it is
 * in C++, which convert() gives. A marked line has the class cmil-linked-line.
 */
import {StateEffect, StateField, type Extension} from '@codemirror/state';
import {Decoration, EditorView, type DecorationSet} from '@codemirror/view';

/** Marks lines, from 1, of an editor; an empty list marks none. */
export const markLines = StateEffect.define<number[]>();

const mark = Decoration.line({class: 'cmil-linked-line'});

const field = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update: (marks, transaction) => {
    for (const effect of transaction.effects) {
      if (!effect.is(markLines)) continue;
      const {doc} = transaction.state;
      const lines = [...new Set(effect.value)].filter(line => line >= 1 && line <= doc.lines).sort((a, b) => a - b);
      return Decoration.set(lines.map(line => mark.range(doc.line(line).from)));
    }
    return transaction.docChanged ? marks.map(transaction.changes) : marks;
  },
  provide: decorations => EditorView.decorations.from(decorations)
});

/**
 * Marked lines, and the line of the cursor as it moves, from 1, or null when the editor isn't focused.
 */
export const linkedLines = (onCursor: (line: number | null) => void): Extension => [
  field,
  EditorView.updateListener.of(update => {
    if (update.selectionSet || update.focusChanged) {
      onCursor(update.view.hasFocus ? update.state.doc.lineAt(update.state.selection.main.head).number : null);
    }
  })
];

/** Marks the lines in an editor, and scrolls the first of them into view. */
export const showLines = (view: EditorView, lines: number[]): void => {
  const first = lines.find(line => line >= 1 && line <= view.state.doc.lines);
  view.dispatch({
    effects: [
      markLines.of(lines),
      ...(first ? [EditorView.scrollIntoView(view.state.doc.line(first).from, {y: 'nearest'})] : [])
    ]
  });
};
