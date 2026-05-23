<p align="center">
  <img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel" />
  <img src="https://img.shields.io/badge/Backend-Azure-0078D4?style=for-the-badge&logo=microsoftazure" />
  <img src="https://img.shields.io/badge/Database-Azure_SQL-CC2927?style=for-the-badge&logo=microsoftsqlserver" />
  <img src="https://img.shields.io/badge/AI-Gemini_2.0-4285F4?style=for-the-badge&logo=googlegemini" />
</p>

# ✈️ Trippin — AI-Powered Travel Super App

> A production-grade, full-stack travel platform with **AI itinerary generation**, **real-time flight/hotel/train search**, **OAuth authentication**, and **role-based access control** — built with React 19 and .NET 10.

<p align="center">
  <a href="https://trippin-travel-super-app.vercel.app"><strong>🌐 Live Demo</strong></a> ·
  <a href="https://trippin-rg-eka7fqhgc8a0d2hj.centralindia-01.azurewebsites.net/swagger"><strong>📡 API Docs</strong></a>
</p>

---

## 🏗️ Architecture

```
CLIENT (React 19 + Vite 8 + Framer Motion)  →  Deployed on Vercel
        │
        │ HTTPS (REST)
        ▼
SERVER (.NET 10 Minimal API + EF Core)      →  Deployed on Azure App Service
        │
        ├── Azure SQL Database
        ├── Google Gemini 2.0 AI
        └── RapidAPI (Booking.com + IRCTC + Pexels)
```

---

## ⚡ Key Features

### 🔍 Multi-Modal Travel Search
Real-time search across **4 travel verticals** with smart caching and auto-retry:

| Mode | Provider | Features |
|------|----------|----------|
| ✈️ Flights | Booking.com API | Price, stops, duration, airline filtering |
| 🏨 Hotels | Booking.com API | Star rating, price, review scores, images |
| 🚂 Trains | IRCTC API | Station code resolution, schedule lookup |
| 🚕 Taxis | Booking.com API | Estimated time, vehicle type, pricing |

### 🤖 AI-Powered Itinerary Generation
- Powered by **Google Gemini 2.0 Flash**
- Generates day-by-day travel plans with activities, timings & tips
- Context-aware — uses trip destinations, dates, and user preferences

### 🔐 Enterprise-Grade Authentication
- **JWT** token-based auth with 7-day expiry
- **OAuth 2.0** — Google, GitHub, Microsoft
- Secure password hashing with **BCrypt**
- Auto-refresh token interceptors on the frontend

### 👥 Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Admin** | Manage all users, assign roles, platform stats, delete accounts |
| **Manager** | View all bookings, manage destinations, heal images |
| **User** | Own trips, bookings, reviews, itineraries |

### 🗺️ Interactive Maps & Discovery
- **Leaflet.js** maps for destination visualization
- Trending destinations with real-time ranking
- Personalized recommendations based on user history
- Weather widget for destination planning

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI framework |
| Vite | 8.0 | Build tool & dev server |
| React Router | 7.14 | Client-side routing |
| Framer Motion | 12.38 | Page transitions & animations |
| TanStack Query | 5.99 | Server state & caching |
| Axios | 1.15 | HTTP client with JWT interceptors |
| Leaflet | 1.9 | Interactive maps |
| Lucide React | 1.8 | Icon system |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| .NET | 10.0 | Minimal API framework |
| Entity Framework Core | 10.0 | ORM with migrations |
| JWT Bearer | 10.0 | Token authentication |
| BCrypt.Net | 4.1 | Password hashing |
| Google.Apis.Auth | 1.73 | OAuth verification |
| Swashbuckle | 10.1 | Swagger/OpenAPI docs |

### Infrastructure
| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend | Vercel | CDN-backed global deployment |
| Backend | Azure App Service | .NET 10 managed hosting |
| Database | Azure SQL | Managed SQL Server |

---

## 📁 Project Structure

```
Trippin-Travel-SuperApp/
├── TrippinBackend/Trippin.API/
│   ├── ApiEndpoints.cs            # 40+ REST endpoints
│   ├── Program.cs                 # DI, middleware, auth pipeline
│   ├── Models/                    # 8 EF Core entities
│   ├── DTOs/                      # Request/Response contracts
│   ├── Services/                  # 12 business logic services
│   │   ├── RapidTravelService.cs  # Multi-provider search + caching
│   │   ├── GeminiService.cs       # AI itinerary generation
│   │   ├── AuthService.cs         # JWT auth + registration
│   │   ├── OAuthService.cs        # Google, GitHub, Microsoft
│   │   └── ...7 more services
│   ├── Middleware/                 # Global error handling
│   └── Data/                      # DbContext & migrations
│
├── TrippinFrontend/src/
│   ├── pages/                     # 12 page components
│   ├── components/                # 21 reusable UI components
│   ├── hooks/                     # 6 custom hooks
│   ├── contexts/                  # Auth & Currency providers
│   └── api/                       # Axios with interceptors
```

---

## 🔌 API Endpoints (40+)

### Auth & Search (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | JWT login |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/github` | GitHub OAuth |
| GET | `/api/search/flights` | Real-time flight search |
| GET | `/api/search/hotels` | Real-time hotel search |
| GET | `/api/search/trains` | Real-time train search |
| GET | `/api/search/taxis` | Real-time taxi search |

### Protected Resources
| Method | Endpoint | Access |
|--------|----------|--------|
| CRUD | `/api/trips/*` | Authenticated (own data) |
| CRUD | `/api/bookings/*` | Authenticated (own data) |
| CRUD | `/api/reviews/*` | Authenticated (own data) |
| POST | `/api/itineraries/generate` | Authenticated |

### Admin Panel
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/users` | Admin only |
| PATCH | `/api/admin/users/{id}/role` | Admin only |
| DELETE | `/api/admin/users/{id}` | Admin only |
| GET | `/api/admin/bookings` | Admin + Manager |
| GET | `/api/admin/stats` | Admin only |

---

## 🛡️ Security

- ✅ JWT Authentication with role claims
- ✅ BCrypt password hashing
- ✅ 3-tier RBAC (Admin / Manager / User)
- ✅ Rate Limiting — 30 req/min (Fixed Window)
- ✅ CORS — Whitelisted origins only
- ✅ Soft Delete — No permanent data loss
- ✅ Input Validation on all DTOs
- ✅ Global Error Handling Middleware
- ✅ API Response Caching (7-day location cache)
- ✅ Anti-Throttle Retry with exponential backoff

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/VanshRana-1004/Trippin-Travel-SuperApp.git

# Backend
cd TrippinBackend/Trippin.API
cp appsettings.example.json appsettings.json  # Add your keys
dotnet restore && dotnet ef database update && dotnet run

# Frontend (new terminal)
cd TrippinFrontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
npm run dev
```

---

## 🌐 Live Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | [trippin-travel-super-app.vercel.app](https://trippin-travel-super-app.vercel.app) |
| Backend | Azure App Service | Central India region |
| Database | Azure SQL | Managed instance |

---

## 🎯 Skills Demonstrated

| Skill | Implementation |
|-------|---------------|
| **Full-Stack Development** | React 19 + .NET 10 Minimal APIs |
| **Cloud Deployment** | Azure App Service + Vercel + Azure SQL |
| **API Design** | 40+ RESTful endpoints with proper status codes |
| **Authentication** | JWT + OAuth 2.0 (Google, GitHub, Microsoft) |
| **Authorization** | 3-tier RBAC with policy-based guards |
| **AI Integration** | Google Gemini for itinerary generation |
| **Third-Party APIs** | Booking.com, IRCTC, Pexels |
| **Performance** | In-memory caching, retry logic, rate limiting |
| **Database Design** | 8 entities, relationships, soft deletes, migrations |
| **UI/UX** | Framer Motion animations, responsive design |
| **Production Readiness** | Env configs, CORS, HTTPS, SPA routing |

---

## 📌 Roadmap

- [ ] 💳 Stripe payment integration
- [ ] 📱 React Native mobile app
- [ ] 💬 AI travel chatbot assistant
- [ ] 🔔 Real-time notifications (SignalR)
- [ ] 🧑‍💼 Admin dashboard UI
- [ ] 🌍 Multi-language support (i18n)

---

## 👨‍💻 Author

**Vansh Rana**

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/VanshRana18)

---

<p align="center">
  <sub>Built with ❤️ using React 19, .NET 10, and Google Gemini AI</sub><br/>
  <sub>⭐ Star this repo if you found it useful!</sub>
</p>
