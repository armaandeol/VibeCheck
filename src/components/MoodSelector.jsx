import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'

const moods = [
  { name: 'Happy', emoji: '😊', color: 'bg-yellow-400 hover:bg-yellow-500' },
  { name: 'Sad', emoji: '😢', color: 'bg-blue-400 hover:bg-blue-500' },
  { name: 'Relaxed', emoji: '😌', color: 'bg-green-400 hover:bg-green-500' },
  { name: 'Energetic', emoji: '⚡', color: 'bg-orange-400 hover:bg-orange-500' },
  { name: 'Motivated', emoji: '💪', color: 'bg-red-400 hover:bg-red-500' },
  { name: 'Romantic', emoji: '💕', color: 'bg-pink-400 hover:bg-pink-500' },
  { name: 'Nostalgic', emoji: '🌅', color: 'bg-amber-400 hover:bg-amber-500' },
  { name: 'Lonely', emoji: '🌙', color: 'bg-indigo-400 hover:bg-indigo-500' },
  { name: 'Hopeful', emoji: '🌟', color: 'bg-cyan-400 hover:bg-cyan-500' },
  { name: 'Playful', emoji: '🎉', color: 'bg-purple-400 hover:bg-purple-500' },
  { name: 'Focused', emoji: '🎯', color: 'bg-teal-400 hover:bg-teal-500' },
  { name: 'Anxious', emoji: '😰', color: 'bg-gray-400 hover:bg-gray-500' },
  { name: 'Inspired', emoji: '✨', color: 'bg-violet-400 hover:bg-violet-500' },
  { name: 'Mellow', emoji: '🍃', color: 'bg-emerald-400 hover:bg-emerald-500' },
  { name: 'Empowered', emoji: '🔥', color: 'bg-rose-400 hover:bg-rose-500' },
]


const MoodSelector = ({ onMoodChange }) => {
  const [selectedMood, setSelectedMood] = useState(null)
  const [showMoods, setShowMoods] = useState(false)
  
  // Refs for animation targets
  const moodGridRef = useRef(null)
  const moodButtonsRef = useRef([])
  const selectedEmojiRef = useRef(null)
  const containerRef = useRef(null)

  // Initialize GSAP context
  useEffect(() => {
    const ctx = gsap.context(() => {}, containerRef)
    return () => ctx.revert()
  }, [])

  // Mood grid entrance animation
  useEffect(() => {
    if (!showMoods || !moodGridRef.current) return
    
    const buttons = [...moodGridRef.current.children]
    
    gsap.set(buttons, {
      opacity: 0,
      y: 20,
      scale: 0.8
    })
    
    gsap.to(buttons, {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: 0.05,
      duration: 0.4,
      ease: "back.out(1.2)",
      delay: 0.2
    })
  }, [showMoods])

  // Selected mood emoji animation
  useEffect(() => {
    if (!selectedMood || !selectedEmojiRef.current) return
    
    gsap.fromTo(selectedEmojiRef.current,
      { scale: 0.5, rotation: -15 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.8,
        ease: "elastic.out(1.2, 0.5)"
      }
    )
  }, [selectedMood])

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood)
    
    // Find the clicked button index
    const index = moods.findIndex(m => m.name === mood.name)
    if (index !== -1 && moodButtonsRef.current[index]) {
      // Button pop animation
      gsap.fromTo(moodButtonsRef.current[index],
        { scale: 1 },
        {
          scale: [1.2, 1],
          duration: 0.5,
          ease: "elastic.out(1.2, 0.5)"
        }
      )
    }

    if (onMoodChange) onMoodChange(mood)
  }

  const handleRandomMood = () => {
    const randomMood = moods[Math.floor(Math.random() * moods.length)]
    handleMoodSelect(randomMood)
    
    // Shuffle animation effect
    gsap.fromTo(containerRef.current,
      { x: 0 },
      {
        x: [10, -10, 8, -8, 0],
        duration: 0.5,
        ease: "power2.inOut"
      }
    )
  }

  return (
    <div 
      ref={containerRef}
      className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200"
    >
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🎭</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Mood Selector</h3>
        <p className="text-gray-600 mb-4">
          Choose your current mood to get personalized recommendations
        </p>
        <button
          onClick={() => setShowMoods(!showMoods)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg"
        >
          {showMoods ? 'Hide Moods' : 'Show Moods'}
        </button>
      </div>

      {showMoods && (
        <div className="mt-6">
          <div 
            ref={moodGridRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6"
          >
            {moods.map((mood, index) => (
              <button
                key={mood.name}
                ref={el => moodButtonsRef.current[index] = el}
                onClick={() => handleMoodSelect(mood)}
                onMouseEnter={() => {
                  if (moodButtonsRef.current[index]) {
                    gsap.to(moodButtonsRef.current[index], {
                      scale: 1.05,
                      duration: 0.3,
                      ease: "power2.out"
                    })
                  }
                }}
                onMouseLeave={() => {
                  if (moodButtonsRef.current[index]) {
                    gsap.to(moodButtonsRef.current[index], {
                      scale: 1,
                      duration: 0.5,
                      ease: "elastic.out(1.2, 0.4)"
                    })
                  }
                }}
                className={`
                  p-4 rounded-xl transition-all duration-200 transform
                  ${selectedMood?.name === mood.name 
                    ? `${mood.color} shadow-lg ring-4 ring-white/50` 
                    : `${mood.color} hover:shadow-md`
                  }
                  text-white font-medium
                `}
              >
                <div className="text-2xl mb-2">{mood.emoji}</div>
                <div className="text-sm font-semibold">{mood.name}</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={handleRandomMood}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              🎲 Random Mood
            </button>
            {selectedMood && (
              <button
                onClick={() => setSelectedMood(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                🗑️ Clear Selection
              </button>
            )}
          </div>

          {selectedMood && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Selected Mood:</h4>
              <div className="flex items-center gap-3">
                <div className="text-3xl" ref={selectedEmojiRef}>
                  {selectedMood.emoji}
                </div>
                <div>
                  <div className="text-gray-800 font-medium text-lg">{selectedMood.name}</div>
                  <div className="text-sm text-gray-600">
                    Perfect! We'll curate content based on your {selectedMood.name.toLowerCase()} mood.
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                <p>💡 <strong>Tip:</strong> Your mood selection will influence music, content, and recommendations</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MoodSelector