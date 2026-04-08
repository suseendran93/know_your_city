# 🎮 Know Your Chennai — Game Idea

## 🧠 Core Concept
Train spatial memory of Chennai through interactive gameplay.

### Gameplay Options:
- Show a place → user guesses:
  - Direction (North / South / East / West)
  - Nearby area
  - Main road
- Show map → user taps correct location

---

## 🎯 Game Modes

### 1. Direction Mode
**Example:**  
"Where is Porur from Velachery?"

- Options: North / South / East / West
- Score-based system

---

### 2. Map Pin Mode
- Show area name
- User taps correct location on map

---

### 3. Route Builder Mode (Advanced)
**Example:**  
"Go from Adyar → Porur"

- User selects route:
  - OMR / IRR / GST / etc.

---

### 4. Daily Challenge
- 5 questions per day
- Streak system
- XP / Level progression

---

## ⚙️ Required APIs

### 🗺️ 1. Maps API (Core)
**Option A: Google Maps Platform**
- Features:
  - Map display
  - Place search
  - Coordinates (lat/lng)
- Pricing:
  - ~$200/month free credit
  - Enough for small apps

---

### 📍 2. Places API
- Autocomplete
- Area search
- Nearby places

---

## 🌍 Free Alternative (Recommended for MVP)

### Use:
- OpenStreetMap (Data)
- Leaflet.js (Map rendering)

### Pros:
- Completely free
- No billing setup

### Cons:
- Slightly more setup
- Less polished than Google Maps

---

## 🧠 Backend / Data

You can start without a backend.

### Sample Data Structure:
```json
{
  "name": "Porur",
  "lat": 13.035,
  "lng": 80.158,
  "zone": "West",
  "mainRoad": "Poonamallee Road",
  "nearby": ["Guindy", "Manapakkam"]
}
```

---

## 💡 Extra Ideas

### 1. Landmark Mode
- Show a famous landmark
- Ask the user to identify the area
- Example: "Phoenix Marketcity is in which area?"

### 2. Metro Challenge
- Ask users to guess the nearest metro station for a place
- Good for Chennai-specific local knowledge

### 3. Difficulty Levels
- Easy: Popular areas only
- Medium: Include roads and nearby zones
- Hard: Lesser-known neighborhoods and route logic

### 4. Time Attack Mode
- Answer as many location questions as possible in 60 seconds
- Faster answers give bonus points

### 5. Local Leaderboard
- Daily and weekly rankings
- Friends challenge link for sharing scores

### 6. Visual Progress Map
- Unlock parts of Chennai as the player improves
- Makes progression feel more tangible

### 7. Category Packs
- North Chennai pack
- South Chennai pack
- Food streets pack
- Beaches and landmarks pack

### 8. Smart Learning Loop
- Repeat places the user gets wrong
- Build a simple memory-training system instead of only a quiz

---

## 🚀 MVP Suggestion

Start with:
- Direction Mode
- Map Pin Mode
- 20-50 Chennai locations
- OpenStreetMap + Leaflet
- Static JSON data

This is enough to validate whether the game is fun before adding routes, daily streaks, and user accounts.
