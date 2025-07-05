import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'


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
  
  // Refs for animation targets
  const gridRef = useRef(null)
  const buttonRefs = useRef([])
  const emojiRef = useRef(null)
  const containerRef = useRef(null)

  // Initialize GSAP context
  useEffect(() => {
    const ctx = gsap.context(() => {}, containerRef)
    return () => ctx.revert()
  }, [])

  // Grid entrance animation
  useEffect(() => {
    if (!showSituations || !gridRef.current) return
    
    const buttons = [...gridRef.current.children]
    
    // Set initial state
    gsap.set(buttons, {
      opacity: 0,
      y: 30,
      scale: 0.8
    })
    
    // Animate in
    gsap.to(buttons, {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: 0.06,
      duration: 0.45,
      ease: "back.out(1.4)",
      delay: 0.2
    })
  }, [showSituations])

  // Selected emoji animation
  useEffect(() => {
    if (!selectedSituation || !emojiRef.current) return
    
    gsap.fromTo(emojiRef.current,
      { scale: 0.3, rotation: -10 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.7,
        ease: "elastic.out(1.4, 0.4)"
      }
    )
  }, [selectedSituation])

  const handleSituationSelect = (situation) => {
    setSelectedSituation(situation)
    
    // Find clicked button
    const index = situations.findIndex(s => s.name === situation.name)
    if (index !== -1 && buttonRefs.current[index]) {
      // Button bounce animation
      gsap.fromTo(buttonRefs.current[index],
        { scale: 1 },
        {
          scale: [1.25, 1],
          duration: 0.6,
          ease: "elastic.out(1.3, 0.5)"
        }
      )
    }

    if (onSituationChange) onSituationChange(situation)
  }

  const handleRandomSituation = () => {
    const randomSituation = situations[Math.floor(Math.random() * situations.length)]
    handleSituationSelect(randomSituation)
    
    // Container shuffle animation
    gsap.fromTo(containerRef.current,
      { x: 0 },
      {
        x: [15, -12, 10, -8, 0],
        duration: 0.6,
        ease: "sine.inOut"
      }
    )
  }

  // Hover animations
  const handleMouseEnter = (index) => {
    if (buttonRefs.current[index]) {
      gsap.to(buttonRefs.current[index], {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }

  const handleMouseLeave = (index) => {
    if (buttonRefs.current[index]) {
      gsap.to(buttonRefs.current[index], {
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1.2, 0.4)"
      })
    }
  }

  return (
    <div 
      ref={containerRef}
      className="h-full flex flex-col"
    >
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🎬</div>
        <h3 className="text-xl font-bold spotify-text-primary mb-3">Situation Selector</h3>
        <p className="spotify-text-secondary mb-6 leading-relaxed">
          Tell us what you're up to for more contextual recommendations
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => setShowSituations(!showSituations)}
            className="spotify-button-secondary"
          >
            {showSituations ? 'Hide Situations' : 'Show Situations'}
          </button>
          <span className="spotify-badge-secondary">Optional</span>
        </div>
      </div>

      {showSituations && (
        <div className="flex-1 flex flex-col">
          <div 
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6"
          >
            {situations.map((situation, index) => (
              <button
                key={situation.name}
                ref={el => buttonRefs.current[index] = el}
                onClick={() => handleSituationSelect(situation)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                className={`
                  p-4 rounded-xl transition-all duration-200 transform min-h-[80px] flex items-center
                  ${selectedSituation?.name === situation.name 
                    ? `${situation.color} shadow-lg ring-4 ring-[#1DB954]/50` 
                    : `${situation.color} hover:shadow-md hover:scale-105`
                  }
                  text-white font-medium
                `}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="text-2xl flex-shrink-0">{situation.emoji}</div>
                  <div className="text-xs sm:text-sm font-semibold leading-tight break-words flex-1">{situation.name}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRandomSituation}
              className="spotify-badge-secondary hover:bg-[#1DB954] hover:text-black transition-colors cursor-pointer"
            >
              🎲 Random Situation
            </button>
            {selectedSituation && (
              <button
                onClick={() => {
                  setSelectedSituation(null)
                  if (onSituationChange) onSituationChange(null)
                }}
                className="spotify-badge-secondary hover:bg-red-500 transition-colors cursor-pointer"
              >
                🗑️ Clear Selection
              </button>
            )}
          </div>

          {selectedSituation && (
            <div className="mt-6 p-4 spotify-card-gradient rounded-xl border border-[#404040]">
              <h4 className="font-semibold spotify-text-primary mb-3">Selected Situation:</h4>
              <div className="flex items-center gap-3">
                <div className="text-3xl" ref={emojiRef}>
                  {selectedSituation.emoji}
                </div>
                <div>
                  <div className="spotify-text-primary font-medium text-lg">{selectedSituation.name}</div>
                  <div className="spotify-text-secondary text-sm">
                    Great! We'll tailor content to match your current situation.
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs spotify-text-muted">
                <p>💡 <strong>Tip:</strong> Your situation context helps us provide more relevant recommendations</p>
              </div>
            </div>
          )}
        </div>
      )}

      {!showSituations && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center spotify-text-muted text-sm">
            <p>Skip this step if you prefer general recommendations</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SituationSelector