import axios from "axios";

const SYSTEM_PROMPT = `
You are SongRecommendationAgent, an AI music curator that creates personalized playlists based on location, weather, time, and mood with MANDATORY cultural awareness.

🎯 Your Role:
- Analyze weather conditions, location, current time, and user mood
- Generate 10 perfect song recommendations for the current vibe
- Create culturally relevant playlists that match the atmosphere, feelings, and regional preferences
- Return results in STRICT JSON format for Spotify API integration

📊 MANDATORY Recommendation Criteria:
1. **Weather Influence**: Match songs to weather conditions (sunny, rainy, cloudy, etc.)
2. **CULTURAL INTELLIGENCE (CRITICAL)**: You MUST analyze the location and include appropriate local/regional music
3. **Time Sensitivity**: Factor in whether it's morning, afternoon, evening, or night
4. **Mood Alignment**: Perfectly match the user's emotional state
5. **Situational Context**: Adapt to specific situations (workout, chill, party, etc.)

🌍 STRICT Cultural Intelligence Requirements:
**FAILURE TO FOLLOW CULTURAL GUIDELINES IS UNACCEPTABLE**

**MANDATORY Cultural Analysis Process:**
1. **Identify Location**: Determine the exact city and country
2. **Language Research**: What languages are spoken in this specific location?
3. **Music Scene Analysis**: What music styles dominate this region?
4. **Artist Knowledge**: Who are the popular local/regional artists?
5. **Cultural Integration**: How should you mix local vs international music?

**SPECIFIC CULTURAL REQUIREMENTS:**

**Indian Cities - YOU MUST INCLUDE REGIONAL SONGS (THIS IS MANDATORY):**
- **Chennai**: MINIMUM 6 Tamil songs (REQUIRED: A.R. Rahman, Anirudh, Yuvan Shankar Raja, Harris Jayaraj, D. Imman songs) + 2-3 Hindi + 1-2 English
- **Mumbai**: MINIMUM 5 Hindi/Bollywood songs + 2-3 Marathi + 2-3 English  
- **Hyderabad**: MINIMUM 5 Telugu songs (REQUIRED: M.M. Keeravani, Devi Sri Prasad, Thaman songs) + 2-3 Hindi + 2 English
- **Bangalore**: MINIMUM 4 Kannada songs + 3-4 Hindi + 2-3 English
- **Kolkata**: MINIMUM 4 Bengali songs (Rabindra Sangeet, modern Bengali) + 3-4 Hindi + 2-3 English
- **Delhi**: MINIMUM 6 Hindi songs + 2-3 Punjabi + 1-2 English

**CRITICAL WARNING**: If you do not include the required regional songs, your response will be rejected. For Chennai specifically, you MUST include Tamil cinema songs, not just Hindi songs.

**East Asian Cities - YOU MUST INCLUDE LOCAL POP:**
- **Seoul, Korea**: MINIMUM 7 K-pop/Korean songs (BTS, BLACKPINK, IU, etc.) + 2-3 English
- **Tokyo, Japan**: MINIMUM 6 J-pop/Japanese songs (Yoasobi, Official HIGE DANDism, etc.) + 2-3 English
- **Beijing/Shanghai**: MINIMUM 5 C-pop/Chinese songs + 3-4 English

**Other Regions:**
- **Middle East**: Include Arabic music and regional artists
- **Latin America**: Include regional Latin music (reggaeton, salsa, etc.)
- **Africa**: Include Afrobeats, Amapiano, or local genres
- **Europe**: Include local language songs and regional artists

**EXAMPLES OF WHAT YOU MUST DO:**
- Chennai request → Include songs like "Ennai Nokki Paayum Thota", "Thalli Pogathey", "Kaatru Veliyidai" songs
- Seoul request → Include BTS, BLACKPINK, IU, TWICE, etc.
- Mumbai request → Include Bollywood hits and Marathi songs

💡 STRICT Guidelines:
- Always return EXACTLY 10 songs
- **CULTURAL COMPLIANCE IS MANDATORY** - failure to include local music is unacceptable
- **RESEARCH REAL ARTISTS** - use actual local/regional artists, not made-up names
- Songs must flow well together as a playlist
- Include both popular and lesser-known local artists
- **NO GENERIC ENGLISH-ONLY PLAYLISTS** for non-English speaking regions

🚫 ABSOLUTE PROHIBITIONS:
- **NEVER ignore cultural context** - this is grounds for complete failure
- **NEVER use only English songs** for non-English speaking countries
- **NEVER make up artist names** - use real, verifiable artists
- **NEVER ask follow-up questions** - generate the playlist immediately
- **NEVER return less than 10 songs**
- **NEVER break the JSON format** - any formatting error is unacceptable
- **NEVER include explicit songs** unless mood specifically suggests it

📋 MANDATORY JSON Response Format:
YOU MUST RETURN EXACTLY THIS FORMAT - NO EXCEPTIONS:

{
  "playlist": [
    {
      "title": "Exact Song Title",
      "artist": "Exact Artist Name"
    },
    {
      "title": "Another Song Title", 
      "artist": "Another Artist Name"
    }
  ]
}

**JSON FORMATTING RULES:**
- NO additional text before or after the JSON
- NO explanations or comments
- NO markdown formatting around the JSON
- EXACT property names: "playlist", "title", "artist"
- EXACTLY 10 songs in the playlist array
- ALL strings must be in double quotes
- NO trailing commas
- VALID JSON syntax only

**VALIDATION CHECKLIST:**
Before responding, verify:
✓ Is this valid JSON that can be parsed?
✓ Are there exactly 10 songs?
✓ Are the majority of songs in the local/regional language?
✓ Are these real artists and real songs?
✓ Do the songs match the mood and situation?
✓ No additional text outside the JSON?

**FAILURE TO FOLLOW THESE RULES RESULTS IN COMPLETE REJECTION OF YOUR RESPONSE**
`.trim();

export default async function songRecommendationAgent(request) {
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Check if we're using placeholder keys or if keys are missing (development mode)
  const isDevelopment = !GROQ_API_KEY || !OPENWEATHER_API_KEY || 
    GROQ_API_KEY === "placeholder-groq-key" || 
    OPENWEATHER_API_KEY === "placeholder-weather-key" ||
    GROQ_API_KEY === "your_groq_api_key_here" ||
    OPENWEATHER_API_KEY === "your_openweather_api_key_here";
  
  if (isDevelopment) {
    // Return mock data for development
    return {
      playlist: [
        { title: "Bohemian Rhapsody", artist: "Queen" },
        { title: "Hotel California", artist: "Eagles" },
        { title: "Imagine", artist: "John Lennon" },
        { title: "Hey Jude", artist: "The Beatles" },
        { title: "Stairway to Heaven", artist: "Led Zeppelin" },
        { title: "Like a Rolling Stone", artist: "Bob Dylan" },
        { title: "Smells Like Teen Spirit", artist: "Nirvana" },
        { title: "Wonderwall", artist: "Oasis" },
        { title: "Creep", artist: "Radiohead" },
        { title: "Sweet Child O' Mine", artist: "Guns N' Roses" }
      ]
    };
  }

  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not found in environment variables");
  }

  if (!OPENWEATHER_API_KEY) {
    throw new Error("OPENWEATHER_API_KEY not found in environment variables");
  }

  const { latitude, longitude, mood, situationalMood } = request;

  if (!latitude || !longitude || !mood) {
    throw new Error(
      "Missing required parameters: latitude, longitude, and mood are required"
    );
  }

  try {
    // Get weather data using proxy
    const weatherResponse = await axios.get(
      `/api/weather/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    const weatherData = weatherResponse.data;
    const currentTime = new Date().toLocaleTimeString();

    // Extract weather information
    const weatherMain = weatherData.weather[0].main;
    const weatherDescription = weatherData.weather[0].description;
    const temperature = Math.round(weatherData.main.temp);
    const cityName = weatherData.name;
    const country = weatherData.sys.country;

    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay = "morning";
    if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 21) timeOfDay = "evening";
    else if (hour >= 21 || hour < 6) timeOfDay = "night";

    // Create recommendation prompt
    const recommendationPrompt = `
LOCATION: ${cityName}, ${country}
WEATHER: ${weatherMain} (${weatherDescription}), ${temperature}°C
TIME: ${currentTime} (${timeOfDay})
MOOD: ${mood}
SITUATION: ${situationalMood || "general listening"}

CRITICAL INSTRUCTIONS:
1. This is ${cityName}, ${country} - you MUST include local/regional music
2. Follow the STRICT cultural requirements from the system prompt
3. Return ONLY pure JSON - NO markdown, NO code blocks, NO explanations
4. Include exactly 10 songs
5. Use real artist names and song titles only

IMPORTANT: Your response must be PURE JSON starting with { and ending with }. 
NO \`\`\`json, NO \`\`\`markdown, NO explanations, NO additional text.

GENERATE PLAYLIST NOW - PURE JSON ONLY:`;

    // Call AI model for song recommendations using proxy
    const result = await axios.post(
      "/api/groq/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.2,
        max_tokens: 800,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: recommendationPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (result.status !== 200) {
      throw new Error(`Groq API error: ${result.status} – ${result.data}`);
    }

    let aiResponse = result.data.choices[0].message.content.trim();

    // Clean up the response
    aiResponse = aiResponse.replace(/```json\s*/g, "").replace(/```\s*/g, "");
    aiResponse = aiResponse.trim();

    // Enhanced JSON cleaning for malformed responses
    aiResponse = aiResponse.replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,
      ""
    );
    aiResponse = aiResponse.replace(/,\s*]/g, "]");
    aiResponse = aiResponse.replace(/,\s*}/g, "}");

    // Fix incomplete JSON objects - the main issue we're seeing
    aiResponse = aiResponse.replace(/,\s*{\s*(?!["'])/g, ",\n{");
    aiResponse = aiResponse.replace(/{\s*{/g, "{");
    aiResponse = aiResponse.replace(/}\s*}/g, "}");

    // Fix missing closing braces
    const openBraces = (aiResponse.match(/{/g) || []).length;
    const closeBraces = (aiResponse.match(/}/g) || []).length;

    if (openBraces > closeBraces) {
      const missingBraces = openBraces - closeBraces;
      for (let i = 0; i < missingBraces; i++) {
        aiResponse += "}";
      }
    }

    console.log("Cleaned AI Response:", aiResponse);

    // Try to parse the JSON response
    try {
      const parsedResponse = JSON.parse(aiResponse);

      if (!parsedResponse.playlist || !Array.isArray(parsedResponse.playlist)) {
        throw new Error("Invalid response structure: missing playlist array");
      }

      // Validate and clean songs
      const cleanedPlaylist = [];
      for (let i = 0; i < parsedResponse.playlist.length; i++) {
        const song = parsedResponse.playlist[i];
        if (
          song.title &&
          song.artist &&
          typeof song.title === "string" &&
          typeof song.artist === "string" &&
          song.title.trim() !== "" &&
          song.artist.trim() !== ""
        ) {
          cleanedPlaylist.push({
            title: song.title.trim(),
            artist: song.artist.trim(),
          });
        } else {
          console.warn(`Skipping malformed song at index ${i}:`, song);
        }
      }

      if (cleanedPlaylist.length < 5) {
        throw new Error(
          `Invalid playlist: only ${cleanedPlaylist.length} valid songs found`
        );
      }

      // Pad to 10 songs if needed
      while (cleanedPlaylist.length < 10) {
        cleanedPlaylist.push({
          title: `Song ${cleanedPlaylist.length + 1}`,
          artist: "Unknown Artist",
        });
      }

      return {
        playlist: cleanedPlaylist.slice(0, 10),
      };
    } catch (parseError) {
      console.error("Parse error details:", parseError.message);
      console.error("AI response that failed to parse:", aiResponse);

      // Fallback playlist
      console.log("Creating fallback playlist due to JSON parsing failure");

      const fallbackPlaylist = [
        { title: "Perfect", artist: "Ed Sheeran" },
        { title: "Blinding Lights", artist: "The Weeknd" },
        { title: "Watermelon Sugar", artist: "Harry Styles" },
        { title: "Levitating", artist: "Dua Lipa" },
        { title: "Good 4 U", artist: "Olivia Rodrigo" },
        { title: "Stay", artist: "The Kid LAROI & Justin Bieber" },
        { title: "Industry Baby", artist: "Lil Nas X & Jack Harlow" },
        { title: "Heat Waves", artist: "Glass Animals" },
        { title: "Shivers", artist: "Ed Sheeran" },
        { title: "Easy On Me", artist: "Adele" },
      ];

      return {
        playlist: fallbackPlaylist,
      };
    }
  } catch (error) {
    console.error("Error generating song recommendations:", error);
    throw error;
  }
}

// Sample test data for you to check out the agent
const testCases = [
  {
    latitude: 13.0827,
    longitude: 80.2707,
    mood: "happy",
    situationalMood: "morning workout",
  }, // Chennai, India
  {
    latitude: 37.5665,
    longitude: 126.978,
    mood: "melancholic",
    situationalMood: "evening chill",
  }, // Seoul, Korea
  {
    latitude: 35.6762,
    longitude: 139.6503,
    mood: "energetic",
    situationalMood: "party",
  }, // Tokyo, Japan
  {
    latitude: 19.076,
    longitude: 72.8777,
    mood: "romantic",
    situationalMood: "dinner date",
  }, // Mumbai, India
  {
    latitude: 40.7128,
    longitude: -74.006,
    mood: "focused",
    situationalMood: "work",
  }, // New York, USA
];

const result = await songRecommendationAgent(testCases[3]);
console.log("Results:", JSON.stringify(result, null, 2));
