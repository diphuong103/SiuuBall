# 🎮 SiuuBall

A 2D arcade physics game built with **JavaScript**, **PixiJS v8**, and **Matter.js**.  
Players draw lines to keep the ball alive, collect score orbs, avoid hazards, and survive as long as possible.

---

## 📷 Preview

> Live Demo

https://siuu-ball.vercel.app/

---

## ✨ Features

### Gameplay

- Physics-based gameplay using Matter.js
- Draw-to-deflect mechanic
- Survival scoring system
- Dynamic Difficulty Scaling
- High Score system
- Mobile & Desktop support

### Orb System

- Mystery Orb
- Score Orbs (+10 / +20 / +50 / +100 / +150)
- Effect System
- Spawn Manager
- Collision Detection

### UI

- Main Menu
- Gameplay HUD
- Guide Popup
- Settings Popup
- Game Over Popup
- Effect Bar
- Toast Notification

### Audio

- Background Music
- Sound Effects
- Music Toggle
- Sound Toggle
- Volume Control

### Performance

- Fixed timestep physics (60 Hz)
- Mobile touch optimization
- Runtime texture downscaling
- WebP assets
- Lazy loading
- Optimized update loop
- Reduced garbage collection

---

# 🛠 Tech Stack

- JavaScript (ES6+)
- PixiJS v8
- Matter.js
- Vite
- Howler.js

---

# 📁 Project Structure

```
src
│
├── assets
│   ├── audio
│   ├── images
│   └── textures
│
├── config
│
├── core
│
├── effects
│
├── entities
│
├── gameplay
│
├── systems
│
├── ui
│
└── utils
```

---

# 🚀 Installation

Clone repository

```bash
git clone https://github.com/diphuong103/SiuuBall.git
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Build production

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

---

# 🎯 Gameplay

The player draws temporary lines to bounce the ball and prevent it from touching the danger zone.

During gameplay, score orbs appear randomly around the arena, allowing players to earn additional points.

Special effect orbs introduce temporary gameplay modifiers such as shields, slow motion, speed changes, gravity changes, and projectile hazards.

The game gradually increases in difficulty over time, encouraging players to survive as long as possible while maximizing their score.

---
