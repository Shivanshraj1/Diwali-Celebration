# Diwali Celebration Platform 🪔

A real-time multiplayer Diwali celebration web application built with React, TypeScript, Tailwind CSS, Web Audio API, and Firebase Authentication & Firestore. Celebrate together live with friends and family across desktop, tablet, and mobile browsers.

## ✨ Features

* **Google Sign-In & Persistent Accounts:** Authenticate securely with Firebase Google Sign-In, maintain sessions across visits, and log out anytime.
* **Real-Time Multiplayer Rooms:** Create or join shared celebration rooms via invite links, invite codes, or direct WhatsApp/native sharing with live online participant lists and join/leave toast notifications.
* **Interactive Festive Wardrobe & Customization:** Dress up your avatar in real time with traditional attire (**Kurta-Pajama, Sherwani, Indo-Western, Saree, Lehenga, Anarkali, Salwar Suit**), **8 Silk & Zari colors**, **8 accessories** (Pagdi, Zari Dupatta, Embroidered Stole, Chandbali Jhumka, Pearl Mala, Maang-Tikka & Bindi, Festive Shades), pose preview toggles, and custom/Google profile photos.
* **Synchronized Fireworks & Soundboard:** Burst *Charkhi*, *Anar*, *Phooljhadi*, *Rocket*, *Skyshots*, and *Sky Calligraphy* via drag-and-drop, touch gestures, or the Cracker Soundboard—all synchronized frame-to-frame with synthesized Web Audio acoustics and broadcast live across participants.
* **Live Room Chat & Mithai Dabba:** Send festive greetings, direct friend wishes, and traditional Diwali sweets (*Kaju Katli*, *Motichoor Ladoo*, *Gulab Jamun*, *Jalebi*, *Besan Barfi*).
* **Beat-Locked 3-2-1 Countdown Intro:** Synchronized 3-2-1 countdown & multi-shell skyshot greeting sequence.
* **Atmospheric Night Sky & Scenes:** Switch between Starlit Courtyard, Celebration Ground, and Rooftop Terrace with floating sky lanterns, shooting stars, and Sitar ambient music.

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide React
* **Backend & Real-Time Sync:** Express Dev/Prod Server, Firebase Authentication & Cloud Firestore
* **Audio & Rendering:** HTML5 Canvas Particle Engine & Web Audio API Synthesizer

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm

### Installation & Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment setup:**
   Copy `.env.example` to `.env` if custom environment variables are used (Firebase web client configuration is stored in `firebase-applet-config.json`, while `.env` files remain gitignored).
3. **Run development server:**
   ```bash
   npm run dev
   ```
4. **Typecheck & production build:**
   ```bash
   npm run lint
   npm run build
   ```
