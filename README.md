# ✈️ Trippin – AI-Powered Travel Super App

A full-stack travel platform that helps users **discover destinations, plan trips intelligently, and manage bookings** — all in one place.

---

## 🚀 Tech Stack

### Frontend

* React (Vite)
* Context API
* Modern CSS + Responsive UI

### Backend

* ASP.NET Core (Minimal APIs)
* Entity Framework Core
* RESTful APIs

### Database

* SQL Server

### Authentication

* JWT Authentication
* OAuth (Google, GitHub, Microsoft)

### Integrations

* 🗺️ Maps & Location Services (Interactive Map)
* 📸 Pexels API (Travel images)
* ✈️ Kiwi API (Flights)
* 🤖 Gemini AI (Itinerary generation)
* 🌍 RapidAPI (Travel data)

---

## ✨ Key Features

### 🔍 Smart Destination Discovery

* Search destinations worldwide
* Dynamic results with images and travel info

### 🧭 AI-Powered Itinerary Generator

* Generate complete travel plans using AI
* Personalized suggestions based on user input

### 🗺️ Interactive Maps

* Visualize destinations on maps
* Explore nearby places and routes

### 🔐 Secure Authentication

* JWT-based login system
* OAuth login (Google, GitHub, Microsoft)

### 🏨 Booking System

* Plan and manage trips
* Extendable for hotels, flights, transport

### ❤️ User Personalization

* Save trips
* View past itineraries
* Profile management

---

## 📁 Project Structure

TrippinBackend/ → ASP.NET Core API
TrippinFrontend/ → React Application

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

git clone https://github.com/your-username/Trippin-Travel-SuperApp.git
cd Trippin-Travel-SuperApp

---

### 2️⃣ Backend Setup

cd TrippinBackend/Trippin.API
dotnet restore
dotnet run

---

### 3️⃣ Frontend Setup

cd TrippinFrontend
npm install
npm run dev

---

## 🔐 Environment Configuration

⚠️ Do NOT use real keys from this repo

### Backend

Update `appsettings.json` with:

* SQL Server connection string
* JWT secret key
* API keys (Kiwi, Pexels, etc.)

Refer:
👉 `appsettings.example.json`

---

### Frontend

Create `.env` file:

VITE_API_URL=http://localhost:5000

---

## 📌 Future Improvements

* 💳 Payment Integration (Stripe)
* 🧑‍💼 Admin Dashboard
* 📱 Mobile App (React Native)
* 💬 AI Travel Assistant Chatbot
* 🔔 Real-time notifications

---

## 🎯 What This Project Demonstrates

* Full-stack development (React + .NET)
* API integration & system design
* Authentication (JWT + OAuth)
* AI feature integration
* Clean architecture & scalability

---

## 👨‍💻 Author

**Vansh Rana**

---

## ⭐ If you like this project

Give it a star and share feedback!
