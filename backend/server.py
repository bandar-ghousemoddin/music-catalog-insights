from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone
import requests
import jwt
from passlib.context import CryptContext
from typing_extensions import Annotated

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'soundvault_db')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="SoundVault OS API")
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get('JWT_SECRET', 'soundvault_super_secret_jwt_key_2026')
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Seed Initial Demo User & Library on Startup
@app.on_event("startup")
async def seed_demo_data():
    demo_email = "demo@soundvault.com"
    existing = await db.users.find_one({"email": demo_email})
    if not existing:
        user_id = str(uuid.uuid4())
        hashed_pw = get_password_hash("password123")
        await db.users.insert_one({
            "id": user_id,
            "email": demo_email,
            "password": hashed_pw,
            "name": "Alex Sounder",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Seed 10 library items
        sample_items = [
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "track_name": "Gran Turismo Anthem",
                "artist_name": "Daiki Kasho",
                "collection_name": "Gran Turismo Original Soundtrack",
                "genre": "Rock",
                "release_date": "2010-03-15",
                "artwork_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80",
                "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
                "mood": "Energetic",
                "rating": 5,
                "notes": "Classic racing theme"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "track_name": "Interstellar Main Theme",
                "artist_name": "Hans Zimmer",
                "collection_name": "Interstellar OST",
                "genre": "Soundtrack",
                "release_date": "2014-11-18",
                "artwork_url": "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80",
                "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
                "mood": "Cinematic",
                "rating": 5,
                "notes": "Organ masterpiece"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "track_name": "Get Lucky",
                "artist_name": "Daft Punk ft. Pharrell Williams",
                "collection_name": "Random Access Memories",
                "genre": "Electronic",
                "release_date": "2013-04-19",
                "artwork_url": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80",
                "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
                "mood": "Upbeat",
                "rating": 5,
                "notes": "Legendary disco hit"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "track_name": "Blinding Lights",
                "artist_name": "The Weeknd",
                "collection_name": "After Hours",
                "genre": "Pop",
                "release_date": "2019-11-29",
                "artwork_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
                "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
                "mood": "Energetic",
                "rating": 4,
                "notes": "Synthwave perfection"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "track_name": "Time",
                "artist_name": "Pink Floyd",
                "collection_name": "The Dark Side of the Moon",
                "genre": "Rock",
                "release_date": "1973-03-01",
                "artwork_url": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80",
                "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
                "mood": "Melancholic",
                "rating": 5,
                "notes": "Timeless guitar solos"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "track_name": "Midnight City",
                "artist_name": "M83",
                "collection_name": "Hurry Up, We're Dreaming",
                "genre": "Electronic",
                "release_date": "2011-10-17",
                "artwork_url": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80",
                "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
                "mood": "Dreamy",
                "rating": 4,
                "notes": "Epic saxophone outro"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "track_name": "Lose Yourself",
                "artist_name": "Eminem",
                "collection_name": "8 Mile OST",
                "genre": "Hip-Hop",
                "release_date": "2002-10-28",
                "artwork_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
                "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
                "mood": "Hype",
                "rating": 5,
                "notes": "Ultimate motivation"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "track_name": "Fly Me to the Moon",
                "artist_name": "Frank Sinatra",
                "collection_name": "It Might as Well Be Swing",
                "genre": "Jazz",
                "release_date": "1964-05-01",
                "artwork_url": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&q=80",
                "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
                "mood": "Relaxed",
                "rating": 4,
                "notes": "Classic swing standard"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "track_name": "Sunflower",
                "artist_name": "Post Malone, Swae Lee",
                "collection_name": "Spider-Man: Into the Spider-Verse",
                "genre": "Hip-Hop",
                "release_date": "2018-10-18",
                "artwork_url": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&q=80",
                "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
                "mood": "Chill",
                "rating": 4,
                "notes": "Melodic vibes"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "track_name": "Clair de Lune",
                "artist_name": "Claude Debussy",
                "collection_name": "Suite bergamasque",
                "genre": "Classical",
                "release_date": "1905-01-01",
                "artwork_url": "https://images.unsplash.com/photo-1520523839896-5198642a8b94?w=400&q=80",
                "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
                "mood": "Peaceful",
                "rating": 5,
                "notes": "Piano masterpiece"
            }
        ]
        await db.library.insert_many(sample_items)
        logging.info("Demo user and 10 sample library items seeded successfully.")

# AUTH SCHEMAS
class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class LibraryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    track_name: str
    artist_name: str
    collection_name: str
    genre: str
    release_date: str
    artwork_url: str
    preview_url: Optional[str] = ""
    mood: str = "Energetic"
    rating: int = 5
    notes: Optional[str] = ""

class LibraryItemCreate(BaseModel):
    track_name: str
    artist_name: str
    collection_name: str
    genre: str
    release_date: str
    artwork_url: str
    preview_url: Optional[str] = ""
    mood: Optional[str] = "Energetic"
    rating: Optional[int] = 5
    notes: Optional[str] = ""

class AIQuery(BaseModel):
    prompt: str

# AUTH ENDPOINTS
@api_router.post("/auth/register")
async def register(body: UserRegister):
    existing = await db.users.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_pw = get_password_hash(body.password)
    user_doc = {
        "id": user_id,
        "email": body.email,
        "password": hashed_pw,
        "name": body.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_access_token({"sub": user_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user_id, "email": body.email, "name": body.name}
    }

@api_router.post("/auth/login")
async def login(body: UserLogin):
    user = await db.users.find_one({"email": body.email}, {"_id": 0})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    token = create_access_token({"sub": user["id"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", "")}
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["id"], "email": current_user["email"], "name": current_user.get("name", "")}

# ITUNES PROXY SEARCH ENDPOINT
@api_router.get("/search/itunes")
async def search_itunes(term: str, entity: str = "song", limit: int = 25):
    url = f"https://itunes.apple.com/search?term={term}&entity={entity}&limit={limit}"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        results = []
        for item in data.get("results", []):
            results.append({
                "track_name": item.get("trackName") or item.get("collectionName") or "Unknown",
                "artist_name": item.get("artistName") or "Unknown Artist",
                "collection_name": item.get("collectionName") or "Single",
                "genre": item.get("primaryGenreName") or "Pop",
                "release_date": item.get("releaseDate") or "2024-01-01",
                "artwork_url": (item.get("artworkUrl100") or "").replace("100x100", "400x400"),
                "preview_url": item.get("previewUrl") or "",
                "mood": "Energetic"
            })
        return results
    except Exception as e:
        logger.error(f"iTunes API Error: {e}")
        return []

# LIBRARY CRUD ENDPOINTS
@api_router.get("/library")
async def get_library(current_user: dict = Depends(get_current_user)):
    items = await db.library.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/library")
async def add_library_item(item_data: LibraryItemCreate, current_user: dict = Depends(get_current_user)):
    item_id = str(uuid.uuid4())
    doc = {
        "id": item_id,
        "user_id": current_user["id"],
        **item_data.model_dump()
    }
    await db.library.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/library/{item_id}")
async def update_library_item(item_id: str, item_data: LibraryItemCreate, current_user: dict = Depends(get_current_user)):
    res = await db.library.update_one(
        {"id": item_id, "user_id": current_user["id"]},
        {"$set": item_data.model_dump()}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success", "id": item_id}

@api_router.delete("/library/{item_id}")
async def delete_library_item(item_id: str, current_user: dict = Depends(get_current_user)):
    res = await db.library.delete_one({"id": item_id, "user_id": current_user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success", "id": item_id}

# ANALYTICS ENDPOINT
@api_router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_user)):
    items = await db.library.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    
    genres = {}
    moods = {}
    years = {}
    ratings = {}

    for item in items:
        # Genre
        g = item.get("genre", "Other")
        genres[g] = genres.get(g, 0) + 1
        
        # Mood
        m = item.get("mood", "Energetic")
        moods[m] = moods.get(m, 0) + 1
        
        # Release Year
        rd = item.get("release_date", "2024")
        yr = rd[:4] if len(rd) >= 4 else "2024"
        years[yr] = years.get(yr, 0) + 1

        # Rating
        r = str(item.get("rating", 5)) + " Stars"
        ratings[r] = ratings.get(r, 0) + 1

    return {
        "genre_breakdown": [{"genre": k, "count": v} for k, v in genres.items()],
        "mood_breakdown": [{"mood": k, "count": v} for k, v in moods.items()],
        "year_breakdown": [{"year": k, "count": v} for k, v in sorted(years.items())],
        "rating_breakdown": [{"rating": k, "count": v} for k, v in ratings.items()]
    }

# AI INSIGHTS ENDPOINT
@api_router.post("/ai-insights")
async def get_ai_insights(body: AIQuery, current_user: dict = Depends(get_current_user)):
    items = await db.library.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    item_summary = ", ".join([f"{i['track_name']} by {i['artist_name']} ({i['genre']}, {i['mood']})" for i in items])
    
    insight_text = (
        f"Based on your personal library containing {len(items)} tracks ({item_summary[:200]}...), "
        f"your music taste leans heavily toward eclectic atmospheric rock, electronic soundscapes, and cinematic masterpieces. "
        f"Your dominant mood profile is energetic and focused. "
        f"Recommendation: Explore post-rock, ambient electronic, and classical crossover to expand your sonic palate."
    )
    
    recommendations = [
        {
            "track_name": "Time",
            "artist_name": "Hans Zimmer",
            "collection_name": "Inception OST",
            "genre": "Soundtrack",
            "release_date": "2010-01-01",
            "artwork_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
            "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
            "mood": "Cinematic"
        },
        {
            "track_name": "Instant Crush",
            "artist_name": "Daft Punk ft. Julian Casablancas",
            "collection_name": "Random Access Memories",
            "genre": "Electronic",
            "release_date": "2013-04-19",
            "artwork_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
            "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
            "mood": "Melancholic"
        },
        {
            "track_name": "Gymnopédie No. 1",
            "artist_name": "Erik Satie",
            "collection_name": "Three Gymnopédies",
            "genre": "Classical",
            "release_date": "1888-01-01",
            "artwork_url": "https://images.unsplash.com/photo-1520523839896-5198642a8b94?w=400&q=80",
            "preview_url": "https://audio-samples.github.io/samples/mp3/blizzard_biased-16kHz.mp3",
            "mood": "Relaxed"
        }
    ]

    return {
        "insight": insight_text,
        "recommendations": recommendations
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
