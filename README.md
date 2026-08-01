# SoundVault OS - Music Catalog Insights Platform

SoundVault OS is a production-ready, full-stack web application designed for searching public music catalogs, managing personal libraries with JWT authentication, visualizing advanced analytics through interactive charts, generating AI recommendations, and sharing curations via social export tools.

---

## 1. Setup & Installation Guide

### Prerequisites
- Node.js (v18+) & Yarn
- Python (v3.10+)
- MongoDB running locally or via connection string (`MONGO_URL`)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend Setup
```bash
cd frontend
yarn install
yarn start
```

---

## 2. Database Schema (MongoDB)

### Users Collection (`users`)
- `id` (String, UUID): Unique user identifier
- `email` (String): User email address (unique)
- `password` (String): Bcrypt hashed password
- `name` (String): Full name of the user
- `created_at` (String): ISO timestamp of registration

### Library Collection (`library`)
- `id` (String, UUID): Unique library item identifier
- `user_id` (String): Foreign key referencing `users.id`
- `track_name` (String): Song or album title
- `artist_name` (String): Artist or band name
- `collection_name` (String): Album or collection name
- `genre` (String): Primary musical genre (e.g. Rock, Pop, Electronic, Jazz)
- `release_date` (String): Release date or year
- `artwork_url` (String): High-resolution artwork image URL
- `preview_url` (String): 30-second iTunes audio preview stream
- `mood` (String): Mood classification tag (e.g. Energetic, Cinematic, Melancholic, Relaxed)
- `rating` (Integer): User rating (1 to 5 stars)
- `notes` (String): Personal collector notes

---

## 3. AI Feature & Mood Classification

SoundVault OS features an AI assistant that analyzes the user's personal library collection in real-time. 
- **Taste Synthesis**: Inspects track distributions, genres, and release decades to generate a tailored music taste profile.
- **Intelligent Recommendations**: Suggests top matching tracks with instant "Add to Library" actions.
- **Automated Mood Tagging**: Classifies tracks into moods (Energetic, Cinematic, Melancholic, Chill, Upbeat).

---

## 4. Architectural Trade-Offs & Decisions

1. **Client-Side vs Server-Side Analytics**:
   - *Decision*: Computed both on backend REST endpoints (`/api/analytics`) and cached via React state.
   - *Trade-Off*: Fast dashboard render times with clean Recharts integration while keeping MongoDB queries lightweight.

2. **iTunes Public API Proxy**:
   - *Decision*: Implemented a FastAPI proxy (`/api/search/itunes`) rather than direct frontend requests.
   - *Trade-Off*: Prevents CORS restrictions in browser environments and standardizes response payloads.

3. **Pre-Seeding Demo Data**:
   - *Decision*: Automatically seeds a demo account (`demo@soundvault.com`) with 10 popular tracks across diverse genres on startup.
   - *Trade-Off*: Enables instant testing of charts, library filters, and AI features without manual data entry.
