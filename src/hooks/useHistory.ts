import { useState, useCallback } from 'react';

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [pointer, setPointer] = useState<number>(0);

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prev) => {
      const resolvedState = newState instanceof Function ? newState(prev) : newState;
      
      // If the state is the same, do nothing
      if (JSON.stringify(prev) === JSON.stringify(resolvedState)) {
         return prev;
      }

      setHistory((prevHistory) => {
        // Slice the history up to the current pointer (discarding redo options)
        const newHistory = prevHistory.slice(0, pointer + 1);
        newHistory.push(resolvedState);
        return newHistory;
      });
      
      setPointer((prevPointer) => prevPointer + 1);
      return resolvedState;
    });
  }, [pointer]);

  const undo = useCallback(() => {
    if (pointer > 0) {
      setPointer((prev) => prev - 1);
      setState(history[pointer - 1]);
    }
  }, [history, pointer]);

  const redo = useCallback(() => {
    if (pointer < history.length - 1) {
      setPointer((prev) => prev + 1);
      setState(history[pointer + 1]);
    }
  }, [history, pointer]);

  const revertAll = useCallback(() => {
    if (history.length > 0) {
      setPointer(0);
      setState(history[0]);
    }
  }, [history]);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  // Manual override for syncing state entirely without pushing to history (e.g. initial load)
  const reset = useCallback((newState: T) => {
    setState(newState);
    setHistory([newState]);
    setPointer(0);
  }, []);

  return { state, set, undo, redo, canUndo, canRedo, revertAll, reset };
}
