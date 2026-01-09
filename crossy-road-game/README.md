# 🐔 Crossy Road - Mobile Edition

A fully-featured mobile-optimized Crossy Road clone with comprehensive touch controls, built with Three.js.

## 🎮 Features

### Mobile Controls (PACKED!)

#### 1. **Swipe Gesture Controls**
- **Swipe Up**: Move forward
- **Swipe Down**: Move backward
- **Swipe Left**: Move left
- **Swipe Right**: Move right
- **Quick Tap**: Move forward
- **Adjustable sensitivity** in settings

#### 2. **On-Screen D-Pad**
- Visual button controls for precise movement
- Optimized touch targets (44px minimum)
- Haptic feedback on press
- Smooth animations and visual feedback

#### 3. **Keyboard Support** (Desktop)
- Arrow keys for movement
- WASD keys supported
- Spacebar to jump forward

#### 4. **Touch Feedback System**
- Visual ripple effects on touch
- Real-time swipe indicators
- Button press animations
- Smooth transitions

#### 5. **Vibration Feedback**
- Touch vibrations
- Collision feedback
- Coin collection haptics
- Game over vibration pattern

### Game Features

#### Core Gameplay
- **3D Voxel Graphics** with Three.js
- **Procedural Level Generation** - Infinite gameplay
- **Multiple Lane Types**:
  - Grass (safe zones)
  - Roads (with cars)
  - Railways (with trains)
  - Rivers (with logs to ride)
  - Safe zones (checkpoints)

#### Obstacles & Hazards
- **Cars**: Various speeds and directions
- **Trains**: Fast-moving railway hazards
- **Water**: Instant death without logs
- **Logs**: Moving platforms in water

#### Collectibles
- **Coins**: Earn bonus points
- **Particle Effects**: Visual feedback for collections

#### Lives System
- Start with 3 lives
- Visual heart display
- Respawn on death (until lives run out)

#### Scoring
- Points for forward movement
- Bonus points for coins
- High score tracking (localStorage)
- Distance tracking

### UI Features

#### Screens
1. **Start Screen** - Main menu with game title
2. **Controls Screen** - Detailed control instructions
3. **Settings Screen** - Comprehensive options
4. **Game Screen** - Active gameplay with HUD
5. **Pause Screen** - Pause menu overlay
6. **Game Over Screen** - Stats and replay options

#### HUD Elements
- Live score display
- High score tracker
- Lives indicator (hearts)
- Pause button
- Power-ups display
- Mobile controls overlay

#### Settings
- 🔊 Sound effects toggle
- 🎵 Music toggle
- 📳 Vibration toggle
- 🎮 Show/hide on-screen controls
- ✨ Particle effects toggle
- 👆 Swipe sensitivity slider (20-100)

### Visual Features
- **3D Graphics**: WebGL-powered Three.js rendering
- **Dynamic Camera**: Follows player smoothly
- **Shadows**: Real-time shadow mapping
- **Fog**: Depth-based atmospheric fog
- **Particle Effects**: Explosions and collectibles
- **Smooth Animations**: 60fps gameplay
- **Jump Animation**: Parabolic arc movement

### Mobile Optimizations

#### Performance
- GPU-accelerated rendering
- Optimized draw calls
- Efficient collision detection
- Smooth 60fps on mobile devices
- Adaptive pixel ratio

#### Responsive Design
- **Portrait mode**: Optimized layouts
- **Landscape mode**: Adapted UI positions
- **Tablet support**: Scaled controls
- **Touch targets**: Minimum 44px (Apple guidelines)
- **Viewport locked**: No zoom/scroll

#### Touch Optimizations
- Passive event listeners
- Prevent double-tap zoom
- Touch callout disabled
- User selection disabled
- Tap highlight removed

### Accessibility
- Reduced motion support
- High contrast elements
- Large touch targets
- Clear visual feedback
- Multiple control schemes

## 🚀 Getting Started

### Installation

1. Clone or download the game files
2. Open `index.html` in a modern web browser
3. That's it! No build process required.

### Requirements

- Modern web browser with WebGL support
- For mobile: iOS Safari 13+ or Chrome/Firefox for Android

### Controls Quick Reference

**Mobile:**
- Swipe in any direction to move
- Tap on-screen D-pad buttons
- Quick tap to move forward

**Desktop:**
- Arrow keys or WASD to move
- Spacebar to jump forward

## 📱 Mobile Experience

This game is specifically optimized for mobile devices with:

- Touch-first design
- Swipe gesture recognition
- On-screen virtual controls
- Haptic feedback (where supported)
- Portrait and landscape support
- Responsive layout for all screen sizes

## 🎯 Gameplay Tips

1. **Forward is rewarded** - Moving forward increases your score
2. **Use logs wisely** - In water sections, time your movements to hop on logs
3. **Watch traffic patterns** - Observe obstacle movement before crossing
4. **Collect coins** - Each coin gives bonus points
5. **Save your lives** - You have 3 chances, use them wisely

## 🛠️ Technical Details

### Technology Stack
- **Three.js r128** - 3D graphics rendering
- **Vanilla JavaScript** - Game logic and controls
- **CSS3** - UI and animations
- **HTML5** - Structure and canvas

### Architecture
- Modular game state management
- Event-driven control system
- Procedural content generation
- Efficient object pooling
- Smooth interpolation for movement

### File Structure
```
crossy-road-game/
├── index.html      # Main HTML structure
├── game.js         # Game logic and controls (1000+ lines)
├── styles.css      # Mobile-optimized styles (1000+ lines)
└── README.md       # This file
```

## 🎨 Customization

### Modify Colors
Edit `CONFIG.COLORS` in `game.js`:
```javascript
COLORS: {
    grass: 0x4CAF50,
    road: 0x424242,
    water: 0x2196F3,
    // ... more colors
}
```

### Adjust Difficulty
Edit `CONFIG` object in `game.js`:
```javascript
CAR_SPEED: 0.03,      // Increase for harder
TRAIN_SPEED: 0.08,    // Fast obstacles
LOG_SPEED: 0.02,      // Platform movement
```

### Control Sensitivity
Adjust in-game via Settings screen or edit:
```javascript
SWIPE_THRESHOLD: 50,  // Lower = more sensitive
```

## 🐛 Known Limitations

- Sound effects system is a placeholder (ready for implementation)
- Music system requires audio files
- Power-ups UI displayed but not implemented in gameplay
- Shield and speed power-ups are visual-only

## 📄 License

This is an educational project. Feel free to modify and use for learning purposes.

## 🙏 Credits

- Built with Three.js
- Inspired by the original Crossy Road game
- Created as a comprehensive mobile controls showcase

---

**Enjoy the game!** 🎮🐔
