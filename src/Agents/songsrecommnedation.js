import axios from "axios";

const SYSTEM_PROMPT = `You are a music recommendation expert that creates culturally relevant playlists. Your task is to generate a playlist of 10 songs based on location, weather, time, and mood.

Key Requirements:
1. Return ONLY valid JSON with exactly 10 songs
2. Include local/regional music based on the location
3. Use only real songs and artists
4. Match the mood and weather context
5. Format: { "playlist": [ {"title": "Song Name", "artist": "Artist Name"}, ... ] }

NO explanations, NO comments, NO markdown - JUST the JSON response.`.trim();

export default async function songRecommendationAgent(request) {
  console.log('🎵 [SONG AGENT] Starting song recommendation process with request:', JSON.stringify(request, null, 2));
  
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    console.error('🚨 [SONG AGENT] GROQ_API_KEY not found in environment variables');
    throw new Error("GROQ_API_KEY not found in environment variables");
  }

  const { latitude, longitude, mood, situationalMood, weatherData } = request;

  if (!latitude || !longitude || !mood || !weatherData) {
    console.error('🚨 [SONG AGENT] Missing required parameters:', { latitude, longitude, mood, weatherData: !!weatherData });
    throw new Error(
      "Missing required parameters: latitude, longitude, mood, and weatherData are required"
    );
  }

  try {
    // Extract weather information from passed data
    const weatherMain = weatherData.weather[0].main;
    const weatherDescription = weatherData.weather[0].description;
    const temperature = Math.round(weatherData.main.temp);
    const cityName = weatherData.name;
    const country = weatherData.sys.country;

    console.log('🌍 [SONG AGENT] Location and weather context:', {
      cityName,
      country,
      weather: `${weatherMain} (${weatherDescription})`,
      temperature,
      mood,
      situationalMood
    });

    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay = "morning";
    if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 21) timeOfDay = "evening";
    else if (hour >= 21 || hour < 6) timeOfDay = "night";

    const currentTime = new Date().toLocaleTimeString();

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

    console.log('📝 [SONG AGENT] Sending prompt to Groq:', recommendationPrompt);

    // Call AI model for song recommendations
    console.log('🤖 [SONG AGENT] Making API call to Groq...');
    const startTime = Date.now();
    
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: recommendationPrompt + "\n\nIMPORTANT: Ensure each song has EXACTLY these fields with proper JSON formatting:\n{\n  \"title\": \"Song Title\",\n  \"artist\": \"Artist Name\"\n}",
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✨ [SONG AGENT] Groq response received in ${Date.now() - startTime}ms`);
    
    const aiResponse = response.data.choices[0].message.content.trim();
    console.log('📄 [SONG AGENT] Raw AI response:', aiResponse);
    
    try {
      // Clean the response to ensure it's valid JSON
      let cleanedResponse = aiResponse
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      console.log('🧹 [SONG AGENT] Cleaned response:', cleanedResponse);

      // Fix common JSON formatting issues
      cleanedResponse = cleanedResponse
        .replace(/,\s*,/g, ',')
        .replace(/,\s*]/g, ']')
        .replace(/,\s*}/g, '}')
        .replace(/"\s*,\s*"/g, '","')
        .replace(/"\s*:\s*"/g, '":"')
        .replace(/\{\s*\{/g, '{')
        .replace(/\}\s*\}/g, '}')
        .replace(/"\s*\\*"/g, '"')
        .replace(/\\+/g, '')
        .replace(/,(\s*[}\]])/g, '$1');

      console.log('🔧 [SONG AGENT] JSON-formatted response:', cleanedResponse);

      // Try to parse the cleaned JSON
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanedResponse);
        console.log('✅ [SONG AGENT] Successfully parsed JSON response:', parsedResponse);
      } catch (parseError) {
        console.error('🚨 [SONG AGENT] Failed to parse cleaned response:', parseError);
        console.error('🚨 [SONG AGENT] Cleaned response that failed:', cleanedResponse);
        
        // Try to extract valid song entries
        const songPattern = /"title"\s*:\s*"([^"]+)"\s*,\s*"artist"\s*:\s*"([^"]+)"/g;
        const validSongs = [];
        let match;
        
        while ((match = songPattern.exec(cleanedResponse)) !== null && validSongs.length < 10) {
          validSongs.push({
            title: match[1].trim(),
            artist: match[2].trim()
          });
        }
        
        console.log('🔍 [SONG AGENT] Extracted songs using regex:', validSongs);
        
        if (validSongs.length > 0) {
          parsedResponse = { playlist: validSongs };
        } else {
          throw new Error('Could not extract any valid songs from the response');
        }
      }

      // Validate the response structure
      if (!parsedResponse.playlist || !Array.isArray(parsedResponse.playlist)) {
        console.error('🚨 [SONG AGENT] Invalid response structure:', parsedResponse);
        throw new Error('Invalid response structure: missing playlist array');
      }

      // Clean and validate each song entry
      const validatedPlaylist = parsedResponse.playlist
        .filter(song => {
          const isValid = song && 
            typeof song === 'object' && 
            typeof song.title === 'string' && 
            typeof song.artist === 'string' &&
            song.title.trim() !== '' &&
            song.artist.trim() !== '';
          
          if (!isValid) {
            console.warn('⚠️ [SONG AGENT] Invalid song entry:', song);
          }
          return isValid;
        })
        .map(song => ({
          title: song.title.trim(),
          artist: song.artist.trim()
        }))
        .slice(0, 10);

      console.log('✨ [SONG AGENT] Validated playlist:', validatedPlaylist);

      // Check if we have enough valid songs
      if (validatedPlaylist.length < 5) {
        console.error('🚨 [SONG AGENT] Not enough valid songs:', validatedPlaylist.length);
        throw new Error(`Not enough valid songs: only found ${validatedPlaylist.length}`);
      }

      // Pad the playlist if needed
      while (validatedPlaylist.length < 10) {
        validatedPlaylist.push({
          title: "Dil Diyan Gallan",
          artist: "Atif Aslam"
        });
      }

      console.log('✅ [SONG AGENT] Final playlist ready:', validatedPlaylist);
      return { playlist: validatedPlaylist };

    } catch (error) {
      console.error('🚨 [SONG AGENT] Error processing AI response:', error);
      console.error('🚨 [SONG AGENT] Original AI response:', aiResponse);
      
      // Return a fallback playlist
      const fallbackPlaylist = {
        playlist: [
          { title: "Dil Diyan Gallan", artist: "Atif Aslam" },
          { title: "Tum Hi Ho", artist: "Arijit Singh" },
          { title: "Channa Mereya", artist: "Arijit Singh" },
          { title: "Gerua", artist: "Arijit Singh" },
          { title: "Tere Sang Yaara", artist: "Atif Aslam" },
          { title: "Jeena Jeena", artist: "Atif Aslam" },
          { title: "Pehli Nazar Mein", artist: "Atif Aslam" },
          { title: "Agar Tum Saath Ho", artist: "Arijit Singh" },
          { title: "Hawayein", artist: "Arijit Singh" },
          { title: "Ae Dil Hai Mushkil", artist: "Arijit Singh" }
        ]
      };
      console.log('⚠️ [SONG AGENT] Returning fallback playlist:', fallbackPlaylist);
      return fallbackPlaylist;
    }
  } catch (error) {
    console.error('🚨 [SONG AGENT] Error generating song recommendations:', error);
    throw error;
  }
}