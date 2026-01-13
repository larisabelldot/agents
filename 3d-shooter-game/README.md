# CYBER ARENA - 3D Shooter Game

A fast-paced, action-packed 3D first-person shooter built with Three.js. Battle against intelligent AI bots in a futuristic cyber arena!

## Features

### Core Gameplay
- **First-Person Shooter Mechanics** - Smooth FPS controls with mouse look and WASD movement
- **Fast-Paced Action** - Sprint, jump, and dodge your way through intense combat
- **Intelligent AI Bots** - Bots with pathfinding, vision systems, and combat AI that hunt and attack
- **Dynamic Combat** - Real-time health tracking, score system, and kill feed

### Weapon Arsenal
Choose from 4 unique weapons, each with distinct characteristics:

1. **Pistol** - Reliable sidearm with moderate damage
   - Damage: 25
   - Fire Rate: Medium
   - Magazine: 12 rounds

2. **Assault Rifle** - Fast-firing automatic weapon (Default)
   - Damage: 20
   - Fire Rate: Fast
   - Magazine: 30 rounds

3. **Shotgun** - Devastating close-range powerhouse
   - Damage: 15 per pellet (8 pellets)
   - Fire Rate: Slow
   - Magazine: 8 shells

4. **Sniper Rifle** - High-precision, high-damage marksman weapon
   - Damage: 100
   - Fire Rate: Very Slow
   - Magazine: 5 rounds

### Power-Ups
Collect power-ups scattered around the arena:
- **Health Pack** (Green) - Restore 50 HP
- **Ammo Crate** (Yellow) - Replenish ammunition
- **Speed Boost** (Cyan) - Increase movement speed for 10 seconds

### Visual Effects
- **Muzzle Flashes** - Dynamic particle effects when firing
- **Impact Effects** - Particle explosions on bullet impacts
- **Explosion Effects** - Spectacular death animations for bots
- **Atmospheric Lighting** - Colored point lights and fog for immersion
- **Minimap** - Real-time tactical overview of the arena

### UI/UX
- **Professional Menu System** - Clean, futuristic interface
- **Main Menu** - Start game, view controls, adjust settings
- **HUD Display** - Health bar, ammo counter, score, and minimap
- **Pause Menu** - Pause, resume, or restart at any time
- **Game Over Screen** - Detailed statistics and performance metrics
- **Kill Feed** - Live updates of combat events

### Advanced Features
- **Collision Detection** - Realistic physics for player, bots, and bullets
- **Arena Boundaries** - Walled arena with random cover obstacles
- **Bot Respawning** - Continuous action with automatic bot spawning
- **Weapon Reload System** - Tactical ammunition management
- **Settings** - Customizable sensitivity, graphics quality, volume, and bot count
- **Responsive Design** - Adapts to different screen sizes

## Controls

| Key | Action |
|-----|--------|
| **WASD** | Move |
| **Mouse** | Look Around |
| **Left Click** | Shoot |
| **1-4** | Switch Weapons |
| **Shift** | Sprint |
| **Space** | Jump |
| **R** | Reload |
| **ESC** | Pause Menu |

## How to Play

1. **Open the Game**
   - Open `index.html` in a modern web browser (Chrome, Firefox, Edge recommended)

2. **Start Playing**
   - Click "PLAY" from the main menu
   - Click on the screen to lock your pointer and start
   - Survive as long as possible and rack up kills!

3. **Tips for Success**
   - Use cover to avoid enemy fire
   - Keep moving to make yourself a harder target
   - Switch weapons based on the situation
   - Collect power-ups to stay in the fight
   - Watch your ammo and reload when safe
   - Use the minimap to track enemy positions

## Technical Details

### Technologies Used
- **Three.js (r128)** - 3D graphics rendering
- **Vanilla JavaScript** - Game logic and physics
- **HTML5/CSS3** - UI and styling

### Browser Requirements
- Modern browser with WebGL support
- JavaScript enabled
- Pointer Lock API support

### Performance
- Optimized particle system with lifecycle management
- Efficient collision detection using bounding boxes
- Configurable graphics quality settings
- Runs smoothly on mid-range hardware

## Game Mechanics

### Player
- **Health**: 100 HP
- **Speed**: 10 units/second (15 with sprint)
- **Jump Force**: 8 units
- **Collision**: 1x2x1 bounding box

### Bots
- **Health**: 100 HP
- **Speed**: 6 units/second
- **Vision Range**: 30 units
- **Attack Range**: 25 units
- **Fire Rate**: 800ms
- **Damage**: 15 per shot
- **AI States**: Patrol, Chase, Attack

### Arena
- **Size**: 100x100 units
- **Walls**: 5 units high
- **Obstacles**: 20 random cover objects
- **Fog**: 20-100 unit range for atmosphere

## Scoring System
- **Kill**: +100 points
- **Survival**: +10 points per second
- **Accuracy Tracking**: Shots fired vs shots hit

## Development

### File Structure
```
3d-shooter-game/
├── index.html      # Main HTML file
├── style.css       # Styling and UI
├── game.js         # Game logic and engine
└── README.md       # This file
```

### Key Classes
- `Player` - Player controller and state
- `Bot` - AI enemy with pathfinding and combat
- `Weapon` - Weapon system with stats and firing
- `Bullet` - Projectile physics and collision
- `Particle` - Visual effects system
- `PowerUp` - Collectible items
- `Obstacle` - Level geometry and collision

## Credits

Created with:
- Three.js 3D library
- Modern web technologies
- Passion for fast-paced FPS games!

## License

This is a demonstration project. Feel free to use and modify as you wish!

---

**Enjoy the game and try to beat your high score!**
