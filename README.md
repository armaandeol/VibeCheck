# 🎧 VibeCheck

**Every moment deserves its soundtrack.**  
VibeCheck is a 1-tap music experience that detects your current location and weather, analyzes the mood using AI, and generates a Spotify playlist that perfectly matches your vibe.

---

## 🚀 Features

- 🌍 Auto-detects your location (Geolocation API)
- ☁️ Fetches real-time weather data (OpenWeatherMap API)
- 🧠 Uses a Large Language Model (LLM) to analyze mood
- 🎵 Generates Spotify playlists using Spotify Web API
- 🛠 Built with React, TailwindCSS, and Supabase

---

## 🧠 How It Works

1. User taps **"VIBE CHECK"**
2. **Geolocation API** fetches location
3. **OpenWeatherMap API** gets real-time weather
4. **LLM** interprets mood from environment
5. **Spotify Web API** plays a curated playlist
6. Your surroundings are turned into music — instantly

---

## 🛠 Tech Stack

| Layer       | Tech Used               |
|-------------|-------------------------|
| Frontend    | React, TailwindCSS      |
| Backend     | Supabase                |
| APIs        | Geolocation, OpenWeatherMap, Spotify Web API |
| AI          | LLM (for mood analysis) |

---

## 📸 Screenshots

![image](https://github.com/user-attachments/assets/40d00391-f6cc-429b-97c9-6e301ec26dfc)
![image](https://github.com/user-attachments/assets/59104122-c61e-41fd-a552-a4a1aa137b6a)
![image](https://github.com/user-attachments/assets/ab4f2f9f-ac51-4d4b-9d52-02513f090006)
![image](https://github.com/user-attachments/assets/911634ba-e4e1-4636-8cc1-503840d1fdd9)
![image](https://github.com/user-attachments/assets/af57c69b-b3f6-4d4d-a82d-9ca182f0a1cd)

---

## 🎵 Additional Features

- **Spotify Integration**: Connect your Spotify account to share your music taste
- **Mood-Based Recommendations**: Get personalized music recommendations based on your current mood
- **Friend System**: Add friends and manage friend requests with a comprehensive status system
- **Real-time Chat**: Chat with friends and share music recommendations
- **Profile Management**: Customize your profile with top artists and songs

---

## 🎵 Friend Request System

The platform includes a comprehensive friend request system with the following features:

### Friend Request Statuses
- **Pending**: Friend request has been sent but not yet responded to
- **Accepted**: Friend request has been accepted, users are now friends
- **Rejected**: Friend request has been rejected and removed
- **Cancelled**: Friend request has been withdrawn by the sender

### User Actions
- **Send Request**: Add friends by their email address
- **Accept Request**: Accept incoming friend requests
- **Reject Request**: Reject incoming friend requests
- **Withdraw Request**: Cancel a sent friend request
- **Remove Friend**: Remove an accepted friendship

### Status Indicators
- **Friend**: Green badge for accepted friendships
- **Request Sent**: Yellow badge for pending requests you sent
- **Request Received**: Blue badge for pending requests you received
- **Cancelled**: Gray badge for cancelled requests

---

## 🛠 Database Schema

The application uses Supabase with the following key tables:

- **profiles**: User profile information
- **friends**: Friend relationships with status tracking
- **chat_rooms**: Chat room management
- **chat_participants**: Chat room membership
- **chat_messages**: Message storage

---

## 🎵 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your Supabase project and run the schema migration
4. Configure environment variables
5. Start the development server: `npm run dev`

---

## 🎵 Environment Variables

Create a `.env` file with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=your_spotify_redirect_uri
```
