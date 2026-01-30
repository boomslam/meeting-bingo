import { useState, useCallback, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { CategoryId, BingoCard, BingoSquare, WinningLine } from './types'
import { CATEGORIES } from './data/categories'
import { generateCard } from './lib/cardGenerator'
import { detectWordsWithAliases } from './lib/wordDetector'
import { checkForBingo } from './lib/bingoChecker'
import { generateShareText, shareResult } from './lib/shareUtils'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { Toast } from './components/ui/Toast'
import { useLocalStorage, clearGameStorage, STORAGE_KEY } from './hooks/useLocalStorage'

type Screen = 'landing' | 'category' | 'game' | 'win'

// Interface for state that can be serialized to JSON
interface PersistedGameState {
  screen: Screen;
  category: CategoryId | null;
  card: BingoCard | null;
  filledWords: string[]; // Array instead of Set for JSON serialization
  startedAt: number | null;
}

const DEFAULT_PERSISTED_STATE: PersistedGameState = {
  screen: 'landing',
  category: null,
  card: null,
  filledWords: [],
  startedAt: null,
};

function App() {
  // Load persisted state from localStorage
  const [persistedState, setPersistedState] = useLocalStorage<PersistedGameState>(
    STORAGE_KEY,
    DEFAULT_PERSISTED_STATE
  );

  // Derive state from persisted state
  const [screen, setScreenInternal] = useState<Screen>(persistedState.screen)
  const [card, setCardInternal] = useState<BingoCard | null>(persistedState.card)
  const [category, setCategoryInternal] = useState<CategoryId | null>(persistedState.category)
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null)
  const [filledWords, setFilledWordsInternal] = useState<Set<string>>(
    new Set(persistedState.filledWords)
  )
  const [startedAt, setStartedAtInternal] = useState<number | null>(persistedState.startedAt)
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })

  // Wrapped setters that also update persisted state
  const setScreen = useCallback((newScreen: Screen | ((prev: Screen) => Screen)) => {
    setScreenInternal(prev => {
      const next = typeof newScreen === 'function' ? newScreen(prev) : newScreen;
      setPersistedState(state => ({ ...state, screen: next }));
      return next;
    });
  }, [setPersistedState]);

  const setCard = useCallback((newCard: BingoCard | null | ((prev: BingoCard | null) => BingoCard | null)) => {
    setCardInternal(prev => {
      const next = typeof newCard === 'function' ? newCard(prev) : newCard;
      setPersistedState(state => ({ ...state, card: next }));
      return next;
    });
  }, [setPersistedState]);

  const setCategory = useCallback((newCategory: CategoryId | null) => {
    setCategoryInternal(newCategory);
    setPersistedState(state => ({ ...state, category: newCategory }));
  }, [setPersistedState]);

  const setFilledWords = useCallback((newWords: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setFilledWordsInternal(prev => {
      const next = typeof newWords === 'function' ? newWords(prev) : newWords;
      setPersistedState(state => ({ ...state, filledWords: Array.from(next) }));
      return next;
    });
  }, [setPersistedState]);

  const setStartedAt = useCallback((newStartedAt: number | null) => {
    setStartedAtInternal(newStartedAt);
    setPersistedState(state => ({ ...state, startedAt: newStartedAt }));
  }, [setPersistedState]);

  // Recalculate winning line from restored card state on initial load
  useEffect(() => {
    if (card && (screen === 'game' || screen === 'win')) {
      const result = checkForBingo(card.squares);
      if (result) {
        setWinningLine(result);
        // If we had a bingo but screen wasn't 'win', update it
        if (screen === 'game') {
          setScreen('win');
        }
      }
    }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle direct link with ?category=X parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');

    if (categoryParam) {
      // Check if it's a valid category
      const validCategory = CATEGORIES.find(c => c.id === categoryParam);
      if (validCategory) {
        // Clear URL param for cleaner sharing after load
        window.history.replaceState({}, '', window.location.pathname);

        // Start fresh game with this category (ignore any persisted state)
        clearGameStorage();
        const newCard = generateCard(validCategory.id);
        setCardInternal(newCard);
        setCategoryInternal(validCategory.id);
        setFilledWordsInternal(new Set());
        setStartedAtInternal(Date.now());
        setScreenInternal('game');
        setPersistedState({
          screen: 'game',
          category: validCategory.id,
          card: newCard,
          filledWords: [],
          startedAt: Date.now(),
        });
      }
    }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
  } = useSpeechRecognition()

  // Handle word detection from transcript
  const handleTranscript = useCallback((newTranscript: string) => {
    if (!card) return

    const detected = detectWordsWithAliases(newTranscript, card.words, filledWords)

    if (detected.length > 0) {
      setCard(prevCard => {
        if (!prevCard) return null

        const newSquares = prevCard.squares.map(row =>
          row.map(sq => {
            if (detected.includes(sq.word) && !sq.isFilled) {
              return {
                ...sq,
                isFilled: true,
                isAutoFilled: true,
                filledAt: Date.now(),
              }
            }
            return sq
          })
        )

        return { ...prevCard, squares: newSquares }
      })

      setFilledWords(prev => {
        const next = new Set(prev)
        detected.forEach(word => next.add(word.toLowerCase()))
        return next
      })
    }
  }, [card, filledWords, setCard, setFilledWords])

  // Check for bingo whenever card changes
  useEffect(() => {
    if (!card || screen !== 'game') return

    const result = checkForBingo(card.squares)
    if (result) {
      setWinningLine(result)
      stopListening()
      setScreen('win')

      // Fire confetti!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [card, screen, stopListening, setScreen])

  // Start a new game
  const handleStartGame = () => {
    setScreen('category')
  }

  // Select category and generate card
  const handleSelectCategory = (categoryId: CategoryId) => {
    setCategory(categoryId)
    const newCard = generateCard(categoryId)
    setCard(newCard)
    setFilledWords(new Set())
    setWinningLine(null)
    setStartedAt(Date.now())
    setScreen('game')
  }

  // Toggle listening
  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening(handleTranscript)
    }
  }

  // Manual square toggle
  const handleSquareClick = (square: BingoSquare) => {
    if (square.isFreeSpace || screen !== 'game') return

    setCard(prevCard => {
      if (!prevCard) return null

      const newSquares = prevCard.squares.map(row =>
        row.map(sq => {
          if (sq.id === square.id) {
            const nowFilled = !sq.isFilled
            // Update filledWords
            if (nowFilled) {
              setFilledWords(prev => new Set(prev).add(sq.word.toLowerCase()))
            } else {
              setFilledWords(prev => {
                const next = new Set(prev)
                next.delete(sq.word.toLowerCase())
                return next
              })
            }
            return {
              ...sq,
              isFilled: nowFilled,
              isAutoFilled: false,
              filledAt: nowFilled ? Date.now() : null,
            }
          }
          return sq
        })
      )

      return { ...prevCard, squares: newSquares }
    })
  }

  // Share result
  const handleShare = async () => {
    if (!category || !startedAt) return

    const duration = Date.now() - startedAt
    const filledCount = card?.squares.flat().filter(s => s.isFilled && !s.isFreeSpace).length ?? 0
    const categoryName = CATEGORIES.find(c => c.id === category)?.name ?? category
    const text = generateShareText(categoryName, filledCount, duration)

    try {
      const usedNativeShare = await shareResult(text)
      if (!usedNativeShare) {
        setToast({ message: 'Copied to clipboard!', visible: true })
      }
    } catch {
      setToast({ message: 'Failed to share', visible: true })
    }
  }

  // Play again
  const handlePlayAgain = () => {
    clearGameStorage()
    setScreen('category')
    setCard(null)
    setCategory(null)
    setWinningLine(null)
    setFilledWords(new Set())
    setStartedAt(null)
  }

  // Landing screen
  if (screen === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">🎯 Meeting Bingo</h1>
          <p className="text-xl mb-8 opacity-90">
            Turn any meeting into a game!
            <br />
            Auto-detects buzzwords using speech recognition
          </p>
          <button
            onClick={handleStartGame}
            className="px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            🎮 New Game
          </button>
          {!isSupported && (
            <p className="mt-4 text-yellow-200 text-sm">
              ⚠️ Speech recognition not supported in this browser.
              <br />
              Manual play is still available!
            </p>
          )}
        </div>
      </div>
    )
  }

  // Category selection screen
  if (screen === 'category') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Choose your buzzword pack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat.id)}
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-left"
            >
              <span className="text-4xl">{cat.icon}</span>
              <h3 className="text-lg font-bold text-gray-800 mt-2">{cat.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Win screen
  if (screen === 'win') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-500 to-emerald-600">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">🎉 BINGO!</h1>
          <p className="text-xl mb-8 opacity-90">
            You got {winningLine?.type === 'diagonal' ? 'a diagonal' : `a ${winningLine?.type}`}!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleShare}
              className="px-8 py-4 bg-white text-green-600 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg"
            >
              📤 Share Result
            </button>
            <button
              onClick={handlePlayAgain}
              className="px-8 py-4 bg-green-700 text-white rounded-full font-bold text-lg hover:bg-green-800 transition-all shadow-lg"
            >
              🔄 Play Again
            </button>
          </div>
        </div>
        <Toast
          message={toast.message}
          isVisible={toast.visible}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      </div>
    )
  }

  // Game screen
  const selectedCategory = CATEGORIES.find(c => c.id === category)

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-100">
      {/* Header */}
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold text-indigo-600">
          {selectedCategory?.icon} {selectedCategory?.name} Bingo
        </h1>
      </header>

      {/* Bingo Card */}
      <main className="w-full max-w-lg">
        <div className="bg-white rounded-xl shadow-lg p-3">
          <div className="grid grid-cols-5 gap-1.5">
            {card?.squares.flat().map(square => {
              const isWinning = winningLine?.squares.includes(square.id)
              return (
                <button
                  key={square.id}
                  onClick={() => handleSquareClick(square)}
                  disabled={square.isFreeSpace}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center p-1
                    text-xs font-medium text-center transition-all
                    ${square.isFreeSpace
                      ? 'bg-yellow-100 text-yellow-800 cursor-default'
                      : square.isFilled
                        ? square.isAutoFilled
                          ? 'bg-green-500 text-white scale-95'
                          : 'bg-indigo-500 text-white scale-95'
                        : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 cursor-pointer'
                    }
                    ${isWinning ? 'ring-2 ring-yellow-400' : ''}
                  `}
                >
                  {square.isFreeSpace ? '⭐ FREE' : square.word}
                </button>
              )
            })}
          </div>
        </div>

        {/* Transcript display */}
        {isSupported && (
          <div className="mt-4 p-3 bg-white rounded-lg shadow text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-gray-600 text-xs">
                {isListening ? 'Listening...' : 'Not listening'}
              </span>
            </div>
            <p className="text-gray-700 min-h-[40px]">
              {transcript}
              <span className="text-gray-400">{interimTranscript}</span>
            </p>
            {error && (
              <p className="text-red-500 text-xs mt-1">Error: {error}</p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="mt-4 flex justify-center gap-4">
          {isSupported && (
            <button
              onClick={handleToggleListening}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isListening ? '🛑 Stop Listening' : '🎤 Start Listening'}
            </button>
          )}
          <button
            onClick={handlePlayAgain}
            className="px-6 py-3 rounded-full font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
          >
            🔄 New Card
          </button>
        </div>

        {/* Privacy notice */}
        {isSupported && (
          <p className="mt-4 text-center text-xs text-gray-500">
            🔒 Audio is processed locally. Nothing is recorded or sent to any server.
          </p>
        )}
      </main>
    </div>
  )
}

export default App
