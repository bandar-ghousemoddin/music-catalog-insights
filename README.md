# SoundVault OS - Music Catalog Insights Platform

## Overview
SoundVault OS is a full-stack web application designed for music catalog searching, personal library management with JWT authentication, interactive analytics dashboards, and AI-driven music recommendations/mood classification.

## Core Features
1. **iTunes Search Integration**: Search songs, albums, and artists in real-time via iTunes Search API with live audio previews.
2. **Personal Library Management**: CRUD operations to save, update, filter, rate, and remove music items with MongoDB persistence.
3. **Analytics Dashboard**: 4+ interactive Recharts visualizations (Genre breakdown, mood classification, release year timeline, and rating radar profile).
4. **AI Assistant**: AI-driven music insights, taste analysis, and intelligent recommendations.
5. **Secure Authentication**: JWT-based login/signup with pre-populated sample library items.

## Tech Stack
- **Frontend**: React (JS), Tailwind CSS, Recharts, Lucide Icons, Sonner.
- **Backend**: FastAPI (Python), Motor (Async MongoDB), PyJWT, Passlib (Bcrypt).
- **Database**: MongoDB.
