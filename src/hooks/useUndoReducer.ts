import { useReducer, useCallback, useMemo } from 'react';

interface UndoState<S> {
  past: S[];
  present: S;
  future: S[];
}

type UndoAction<A> = A | { type: 'UNDO' } | { type: 'REDO' };

/** Action types that should not be tracked in undo history (UI-only changes). */
const SKIP_HISTORY_TYPES = new Set(['TOGGLE_COLLAPSE']);

export default function useUndoReducer<S, A extends { type: string }>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  maxHistory = 50,
): [S, (action: UndoAction<A>) => void, { canUndo: boolean; canRedo: boolean }] {
  const undoReducer = useCallback(
    (undoState: UndoState<S>, action: UndoAction<A>): UndoState<S> => {
      if (action.type === 'UNDO') {
        if (undoState.past.length === 0) return undoState;
        const previous = undoState.past[undoState.past.length - 1];
        return {
          past: undoState.past.slice(0, -1),
          present: previous,
          future: [undoState.present, ...undoState.future],
        };
      }

      if (action.type === 'REDO') {
        if (undoState.future.length === 0) return undoState;
        const next = undoState.future[0];
        return {
          past: [...undoState.past, undoState.present],
          present: next,
          future: undoState.future.slice(1),
        };
      }

      // Normal action
      const newPresent = reducer(undoState.present, action as A);

      // Skip history for UI-only actions
      if (SKIP_HISTORY_TYPES.has(action.type)) {
        return { ...undoState, present: newPresent };
      }

      // If state didn't change, don't push to history
      if (newPresent === undoState.present) {
        return undoState;
      }

      const newPast = [...undoState.past, undoState.present];
      // Cap history at maxHistory
      if (newPast.length > maxHistory) {
        newPast.splice(0, newPast.length - maxHistory);
      }

      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    },
    [reducer, maxHistory],
  );

  const [undoState, rawDispatch] = useReducer(undoReducer, {
    past: [],
    present: initialState,
    future: [],
  });

  const meta = useMemo(
    () => ({
      canUndo: undoState.past.length > 0,
      canRedo: undoState.future.length > 0,
    }),
    [undoState.past.length, undoState.future.length],
  );

  return [undoState.present, rawDispatch, meta];
}
