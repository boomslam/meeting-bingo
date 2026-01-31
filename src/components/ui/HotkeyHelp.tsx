interface HotkeyHelpProps {
  isVisible: boolean;
  onClose: () => void;
}

export function HotkeyHelp({ isVisible, onClose }: HotkeyHelpProps) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Toggle listening</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">Space</kbd>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">New card</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">N</kbd>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Back to categories</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">Esc</kbd>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-700">Select square</span>
            <div className="flex gap-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">1-5</kbd>
              <span className="text-gray-400">then</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">1-5</kbd>
            </div>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Show this help</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">?</kbd>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Press <kbd className="px-1 bg-gray-100 rounded">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
