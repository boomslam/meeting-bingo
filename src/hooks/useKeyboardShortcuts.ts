import { useEffect, useCallback, useState } from 'react';

interface KeyboardShortcutHandlers {
  onToggleListening?: () => void;
  onNewCard?: () => void;
  onBackToCategories?: () => void;
  onSelectSquare?: (row: number, col: number) => void;
  onToggleHelp?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onToggleListening,
  onNewCard,
  onBackToCategories,
  onSelectSquare,
  onToggleHelp,
  enabled = true,
}: KeyboardShortcutHandlers) {
  const [pendingRow, setPendingRow] = useState<number | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Don't trigger if modifier keys are held (allow browser shortcuts)
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          onToggleListening?.();
          break;

        case 'n':
        case 'N':
          event.preventDefault();
          onNewCard?.();
          break;

        case 'Escape':
          event.preventDefault();
          // Clear pending row if set, otherwise go back
          if (pendingRow !== null) {
            setPendingRow(null);
          } else {
            onBackToCategories?.();
          }
          break;

        case '?':
          event.preventDefault();
          onToggleHelp?.();
          break;

        // Number keys for square selection (1-5)
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          event.preventDefault();
          const num = parseInt(event.key);
          if (pendingRow === null) {
            // First number = row
            setPendingRow(num);
          } else {
            // Second number = column, select the square
            onSelectSquare?.(pendingRow - 1, num - 1); // Convert to 0-indexed
            setPendingRow(null);
          }
          break;

        default:
          // Clear pending row on any other key
          if (pendingRow !== null) {
            setPendingRow(null);
          }
          break;
      }
    },
    [onToggleListening, onNewCard, onBackToCategories, onSelectSquare, onToggleHelp, pendingRow]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return { pendingRow };
}
