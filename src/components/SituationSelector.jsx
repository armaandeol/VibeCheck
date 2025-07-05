import { useState } from 'react'

const situations = [
  { name: 'Working / Focused', emoji: '💼', color: 'bg-blue-500 hover:bg-blue-600' },
  { name: 'Studying', emoji: '📚', color: 'bg-indigo-500 hover:bg-indigo-600' },
  { name: 'Commuting', emoji: '🚗', color: 'bg-gray-500 hover:bg-gray-600' },
  { name: 'On a walk', emoji: '🚶', color: 'bg-green-500 hover:bg-green-600' },
  { name: 'Winding down', emoji: '🌙', color: 'bg-purple-500 hover:bg-purple-600' },
  { name: 'Waking up', emoji: '☀️', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { name: 'Rainy day indoors', emoji: '🌧️', color: 'bg-slate-500 hover:bg-slate-600' },
  { name: 'Late-night drive', emoji: '🌌', color: 'bg-violet-500 hover:bg-violet-600' },
  { name: 'Post-breakup', emoji: '💔', color: 'bg-red-500 hover:bg-red-600' },
  { name: 'Pre-party hype', emoji: '🎉', color: 'bg-pink-500 hover:bg-pink-600' },
  { name: 'Heartbreak healing', emoji: '🌱', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { name: 'Weekend coffee chill', emoji: '☕', color: 'bg-amber-500 hover:bg-amber-600' },
]

const SituationSelector = ({ onSituationChange }) => {
  const [selectedSituation, setSelectedSituation] = useState(null)
  const [showSituations, setShowSituations] = useState(false)

  const handleSituationSelect = (situation) => {
    setSelectedSituation(situation)
    console.log(`Selected situation: ${situation.name}`)
    // Notify parent component of situation change
    if (onSituationChange) {
      onSituationChange(situation)
    }
  }

  const handleRandomSituation = () => {
    const randomSituation = situations[Math.floor(Math.random() * situations.length)]
    handleSituationSelect(randomSituation)
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🎬</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Situation Selector</h3>
        <p className="text-gray-600 mb-4">
          Tell us what you're up to for more contextual recommendations
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => setShowSituations(!showSituations)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg"
          >
            {showSituations ? 'Hide Situations' : 'Show Situations'}
          </button>
          <span className="text-sm text-gray-500 self-center italic">Optional</span>
        </div>
      </div>

      {showSituations && (
        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {situations.map((situation) => (
              <button
                key={situation.name}
                onClick={() => handleSituationSelect(situation)}
                className={`
                  p-4 rounded-xl transition-all duration-200 transform hover:scale-105 
                  ${selectedSituation?.name === situation.name 
                    ? `${situation.color} shadow-lg scale-105 ring-4 ring-white/50` 
                    : `${situation.color} hover:shadow-md`
                  }
                  text-white font-medium text-left
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{situation.emoji}</div>
                  <div className="text-sm font-semibold leading-tight">{situation.name}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={handleRandomSituation}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              🎲 Random Situation
            </button>
            {selectedSituation && (
              <button
                onClick={() => {
                  setSelectedSituation(null)
                  if (onSituationChange) {
                    onSituationChange(null)
                  }
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                🗑️ Clear Selection
              </button>
            )}
          </div>

          {selectedSituation && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Selected Situation:</h4>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedSituation.emoji}</div>
                <div>
                  <div className="font-medium text-lg">{selectedSituation.name}</div>
                  <div className="text-sm text-gray-600">
                    Great! We'll tailor content to match your current situation.
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                <p>💡 <strong>Tip:</strong> Your situation context helps us provide more relevant recommendations</p>
              </div>
            </div>
          )}
        </div>
      )}

      {!showSituations && (
        <div className="text-center text-gray-500 text-sm">
          <p>Skip this step if you prefer general recommendations</p>
        </div>
      )}
    </div>
  )
}

export default SituationSelector
