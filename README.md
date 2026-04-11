# ProjexaAI
📌 Project Overview

🌟What is UniVerse?
UniVerse (formerly the UniVerse Platform) is an ultra-premium, AI-driven University
Management System built to redefine how students and administrators interact with
campus infrastructure. By abandoning traditional, clunky ERP interfaces, ProjexaAI
introduces an interactive, gamified, and deeply analytical Command Center.
Whether it's predicting a student's GPA utilizing a cognitive load algorithm, hunting
down an exam syllabus using the Neural Search feature, taking an anti-cheat
Computer-Based Test (CBT), or rendering a live geographical routing map of 200+
students—ProjexaAI handles it beautifully at 60FPS.
VITE 8.
REACT 19.
TAILWINDCSS 4.
SQLITE3 DATABAS
EXPRESS.JS BACKEN

🔥Core Features

�Transportation Intelligence Hub (GIS Mapping)
Combines react-leaflet and react-leaflet-cluster to simultaneously
render 208 live student nodes across the geographical grid without lag.
Select a student to fire an instantaneous request to the Open Source Routing
Machine (OSRM) API, dynamically plotting the precise road-polyline route (Street
& true-color Earth modes) from their home to the KRMU campus.
Real-time overlay calculating Driving Distance (KM) and Travel ETA.

🛡Live Anti-Cheat Exam Engine
A strict, fullscreen-locked Computer Based Testing (CBT) interface.
Utilizes the Page Visibility API to instantly issue warnings and trigger automated
exam termination if a student attempts to switch browser tabs or minimize the test.
Includes a Mission Command Pre-Exam Lobby with a live JS countdown tracker
and .ics file integration for native Calendar syncing.

🧠Mental Health & Predictive Analytics
Parses academic data (Attendance, GPA, Assignment Load) through an internal
heuristic algorithm to generate a real-time Cognitive Load Score.
Automatically predicts standard trajectory CGPAs and serves intelligent
intervention protocols when a student's mental baseline drops.

🔎Global Neural Search (Command Palette)
Access the sleek glassmorphism global search bar at the top of the interface.
Using fuzzy-keyword indexing, students can type "bus route", "money", or
"anxiety" to instantly navigate to the Transport, Fees, or Mental Health hubs
flawlessly.

🤖Smart Contextual AI Chatbot
Native intelligent assistant built into the application capable of handling queries
utilizing a robust knowledge graph array for KRMU contexts (academic schedules,
emotional support, deadlines).

🛠Technology Stack
Frontend Setup: React / Vite
Styling & Aesthetics: TailwindCSS, CSS Variables, Framer Motion (for fluid
mount/unmount animations), custom WebGL Shader backgrounds (Three.js).
Charts & Mapping: Recharts, Leaflet, leaflet-cluster.
Backend Runtime: Node.js / Express.js
Database: SQLite3 (Local file-based data.db persistence).

🚀How to Install & Run
1. Clone the Repository
git clone https://github.com/your-username/ProjexaAI.git
cd ProjexaAI
2. Launch the Backend Node.js Server
cd server
npm install
node server.js
(The backend operates concurrently on http://localhost:5001 with an active
SQLite database).
3. Launch the Frontend React Interface Open a new terminal window:
cd client
npm install
npm run dev
(The frontend will automatically launch on the designated Vite port, e.g.,
http://localhost:5176).
4. Login Credentials For demonstration testing using the dynamically seeded data,
use:
Email: Any active student email (e.g. from DB) or you can register a
new account on the landing screen.
Password: password123

📂Architecture Note
This project utilizes a stunning AnimatedShaderBackground.tsx to provide a deep,
dynamic sci-fi nebula effect across all pages. Ensure WebGL is enabled in your
browser parameters to render the graphical UI correctly
