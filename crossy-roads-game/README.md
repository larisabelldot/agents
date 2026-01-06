# 🎮 Epic Crossy Roads 3D

A massive, feature-rich 3D endless runner game inspired by Crossy Road, built with Three.js and vanilla JavaScript!

## 🚀 Features

### Core Gameplay
- **3D Graphics Engine**: Built with Three.js for smooth 3D rendering
- **Endless Procedural Generation**: Infinite terrain with varied obstacles
- **Smooth Camera System**: Dynamic camera that follows the player
- **Intuitive Controls**: Arrow keys, WASD, or touch controls for mobile

### Terrain & Obstacles
- **Multiple Lane Types**:
  - 🌱 Grass lanes with trees and collectibles
  - 🚗 Roads with cars and trucks
  - 🚂 Railway tracks with fast-moving trains
  - 🌊 Rivers with floating logs

- **Smart AI Vehicles**: Cars, trucks, and trains with realistic movement patterns
- **Safe Platforms**: Logs that help you cross rivers

### 🌍 Biomes
The game features 5 distinct biomes that change automatically as you progress:
- **Grasslands** - Classic green fields
- **Desert** - Sandy dunes
- **Snowy Peaks** - Icy wonderland
- **Cyber City** - Urban environment
- **Dark Forest** - Mysterious woods

### 🎭 Characters
Unlock 8 unique characters, each with special abilities:

| Character | Ability | Cost |
|-----------|---------|------|
| 🐔 Chicken | None (Starter) | Free |
| 🐰 Speedster Rabbit | Faster movement | 500 coins |
| 🐸 River Jumper | Water immunity | 750 coins |
| 🦄 Rainbow Unicorn | Double coins | 1000 coins |
| 🤖 Robot X | Shield ability | 1500 coins |
| 🐉 Fire Dragon | Destroy obstacles | 2000 coins |
| 🥷 Shadow Ninja | Teleport ability | 2500 coins |
| 👽 Space Alien | Float over water | 3000 coins |

### ⚡ Power-Ups
Collect power-ups during gameplay for temporary boosts:
- **⚡ Speed Boost**: Move faster for 10 seconds
- **🛡️ Invincibility**: Become invincible to all obstacles
- **🧲 Coin Magnet**: Automatically attract nearby coins
- **✨ 2x Multiplier**: Double all coin collection

### 🏆 Achievements
Complete challenges to unlock achievements:
- First Steps - Reach score 10
- Coin Collector - Collect 50 coins in one game
- Century - Reach score 100
- Survivor - Reach score 250
- Legend - Reach score 500
- Powerup Master - Use 10 powerups
- Rich Player - Collect 1000 total coins
- Character Collector - Unlock 5 characters

### 🌦️ Weather & Environment
- **Dynamic Day/Night Cycle**: Experience time passing with changing lighting
- **Weather Effects**:
  - ☀️ Clear skies
  - 🌧️ Rain
  - ❄️ Snow
  - 🌫️ Fog
- **Adaptive Weather**: Weather changes based on biome

### 🎨 Visual Effects
- **Particle Systems**:
  - Dust clouds when moving
  - Water splashes
  - Explosion effects
  - Weather particles (rain/snow)
- **Dynamic Lighting**: Realistic shadows and day/night transitions
- **Smooth Animations**: Rotating collectibles and floating power-ups

### 🎯 Scoring System
- **Progressive Scoring**: Score increases as you move forward
- **Combo System**: Chain moves quickly for combo multipliers
- **High Score Tracking**: Your best score is saved locally
- **Coin Collection**: Persistent coin bank for unlocking characters

### ⚙️ Settings
Customize your experience:
- Music volume control
- Sound effects volume control
- Graphics quality (Low/Medium/High)
- Toggle particle effects
- Toggle weather effects

### 📱 Mobile Support
- Full touch control support
- Swipe gestures for movement
- Responsive UI design

### 💾 Save System
All progress is automatically saved:
- High scores
- Total coins collected
- Unlocked characters
- Achievement progress
- Settings preferences

## 🎮 How to Play

### Desktop Controls
- **Arrow Keys** or **WASD**: Move in four directions
- **↑/W**: Move forward
- **↓/S**: Move backward
- **←/A**: Move left
- **→/D**: Move right

### Mobile Controls
- **Swipe Up**: Move forward
- **Swipe Down**: Move backward
- **Swipe Left**: Move left
- **Swipe Right**: Move right

### Objective
- Cross as many lanes as possible without getting hit
- Collect coins to unlock new characters
- Use power-ups strategically
- Avoid cars, trucks, and trains
- Jump on logs to cross rivers
- Beat your high score!

## 🚀 Installation & Running

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No build process or dependencies required!

```bash
# Simply open the file
open index.html

# Or use a local server
python -m http.server 8000
# Then visit http://localhost:8000
```

## 🛠️ Technical Details

### Technologies Used
- **Three.js r128**: 3D graphics rendering
- **Vanilla JavaScript**: Pure ES6+ JavaScript
- **CSS3**: Modern styling with animations
- **HTML5**: Semantic markup
- **LocalStorage API**: Persistent game data

### Performance Optimizations
- Efficient object pooling for obstacles
- Dynamic mesh removal for off-screen objects
- Adjustable graphics quality settings
- Optimized particle systems
- Smooth 60 FPS rendering

### File Structure
```
crossy-roads-game/
├── index.html          # Main HTML file
├── style.css           # All styling and animations
├── game.js             # Complete game engine
└── README.md           # This file
```

## 🎨 Game Architecture

### Main Classes
- **Game**: Core game engine and state management
- **Scene Management**: Three.js scene, camera, and renderer setup
- **Terrain System**: Procedural lane generation
- **Obstacle System**: Vehicle and hazard management
- **Character System**: Player and character abilities
- **Particle System**: Visual effects
- **UI System**: Menus and HUD management

### Key Systems
1. **Procedural Generation**: Lanes are generated dynamically as you progress
2. **Collision Detection**: Precise 3D distance-based collision checking
3. **State Management**: Clean state transitions between menu/playing/gameover
4. **Event System**: Keyboard and touch input handling
5. **Save System**: LocalStorage for persistent data

## 🎯 Game Design Highlights

### Difficulty Progression
- Game gets progressively harder as you advance
- More vehicles and faster speeds at higher scores
- Biome changes introduce new visual challenges
- Weather effects add environmental complexity

### Replay Value
- 8 unique characters with different abilities
- Achievement system encourages varied playstyles
- High score competition
- Biome variety keeps gameplay fresh

### Visual Polish
- Smooth camera movements
- Eye-catching particle effects
- Dynamic lighting
- Weather ambiance
- Animated UI elements

## 🐛 Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires:
- WebGL support
- ES6+ JavaScript support
- LocalStorage enabled

## 📝 Future Enhancement Ideas

- Sound effects and background music (Web Audio API integration)
- More characters and abilities
- Additional biomes (lava, space, underwater)
- Boss battles
- Multiplayer mode
- Online leaderboard system
- More power-up types
- Character customization
- Daily challenges

## 🎮 Tips & Tricks

1. **Master the Combo**: Move quickly to build up combo multipliers
2. **Use Character Abilities**: Each character's ability can save you in different situations
3. **Time Your Movements**: Watch vehicle patterns before crossing roads
4. **Collect Power-ups**: They can turn a difficult situation into an easy one
5. **Save Coins**: Some expensive characters are worth the investment
6. **Stay Centered**: Keep to the middle to have escape routes on both sides
7. **Plan River Crossings**: Make sure there's a log to land on before jumping
8. **Watch for Trains**: They're fast and long - give them plenty of space

---

**Have fun and aim for the highest score!** 🏆
