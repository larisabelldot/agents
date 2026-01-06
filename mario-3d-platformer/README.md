# Super Mario 3D Platformer

A fully-featured 3D platformer game inspired by classic Super Mario games, built with Three.js and vanilla JavaScript.

## 🎮 Features

### Complete Game Systems
- **3D Graphics Engine**: Powered by Three.js with real-time rendering
- **Physics System**: Custom platformer physics with gravity, collisions, and movement
- **Character Controller**: Mario-style movement with running, jumping, and double jumping
- **Camera System**: Smooth 3rd-person camera that follows the player
- **Enemy AI**: Intelligent enemies with patrol behavior and collision detection
- **Collectibles**: Coins, stars, and other items to collect
- **Power-Up System**: Mushrooms, fire flowers, and invincibility stars
- **Particle Effects**: Visual effects for collecting items and defeating enemies
- **Audio System**: Synthesized sound effects and music

### Game Features
- **Menu System**: Complete UI with title screen, options, controls, pause menu
- **HUD**: Lives, coins, score, timer, and star counter
- **Multiple Enemy Types**: Goombas and Koopas with unique behaviors
- **Level Design**: Platforms, pipes, question blocks, and bricks
- **Game Progression**: Timer-based gameplay with victory and game over conditions
- **Responsive Design**: Adapts to different screen sizes

## 🎯 Objective

Collect all 3 stars scattered throughout the level before time runs out!

## 🕹️ Controls

| Key | Action |
|-----|--------|
| **W / Arrow Up** | Move Forward |
| **S / Arrow Down** | Move Backward |
| **A / Arrow Left** | Move Left |
| **D / Arrow Right** | Move Right |
| **Space** | Jump (press twice for double jump) |
| **Shift** | Run |
| **Mouse** | Rotate Camera |
| **ESC** | Pause Game |

## 📦 Game Elements

### Player States
- **Small Mario**: Default state, one hit kills
- **Big Mario**: After collecting mushroom, can take one hit
- **Fire Mario**: After collecting fire flower, can take two hits
- **Invincible**: After collecting star, temporary invincibility

### Collectibles
- **Coins**: Worth 100 points each, collect 100 for an extra life
- **Stars**: Main objective items, collect all to win
- **Mushrooms**: Makes Mario bigger and grants extra hit point
- **Fire Flowers**: Upgrades to fire power
- **Starman**: Grants temporary invincibility

### Enemies
- **Goombas**: Brown mushroom enemies that patrol back and forth
- **Koopas**: Turtle enemies with shells

## 🏗️ Project Structure

```
mario-3d-platformer/
├── index.html              # Main HTML file
├── styles/
│   └── main.css           # All styling and UI
├── src/
│   ├── main.js            # Entry point
│   ├── game.js            # Main game controller
│   ├── player.js          # Player character and controls
│   ├── enemies.js         # Enemy AI and behavior
│   ├── collectibles.js    # Coins and stars
│   ├── powerups.js        # Power-up items
│   ├── level.js           # Level design and platforms
│   ├── physics.js         # Physics engine
│   ├── camera.js          # Camera controller
│   ├── input.js           # Input handling
│   ├── audio.js           # Sound system
│   ├── particles.js       # Particle effects
│   ├── hud.js             # HUD manager
│   ├── menu.js            # Menu system
│   └── utils.js           # Utility functions
└── assets/
    ├── models/            # 3D models (procedurally generated)
    ├── textures/          # Textures (procedurally generated)
    └── audio/             # Audio files (synthesized)
```

## 🚀 How to Run

1. Open `index.html` in a modern web browser
2. Click anywhere or press any key to initialize audio
3. Click "START GAME" from the title screen
4. Enjoy playing!

**Note**: This game uses pointer lock for camera control. Click on the game canvas to lock the mouse cursor.

## 🎨 Technical Details

### Technologies Used
- **Three.js**: 3D graphics rendering
- **Web Audio API**: Synthesized sound effects and music
- **Pointer Lock API**: Mouse control for camera
- **Canvas API**: HUD textures
- **Vanilla JavaScript**: No frameworks, pure JS

### Performance Features
- Efficient collision detection using AABB (Axis-Aligned Bounding Boxes)
- Object pooling for particles
- Optimized rendering with Three.js
- Delta time-based updates for smooth gameplay

### Browser Compatibility
- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge (latest versions)
- Pointer Lock API support required

## 🎓 Game Design

This game replicates classic Mario mechanics:
- **Acceleration-based movement**: Gradual speed changes
- **Jump physics**: Variable jump height based on button press duration
- **Double jump**: Additional aerial mobility
- **Enemy stomping**: Defeat enemies by jumping on them
- **Power-up progression**: Small → Big → Fire
- **Collectible rewards**: Points and extra lives
- **Timed gameplay**: Race against the clock

## 📝 Tips & Tricks

1. **Explore thoroughly**: Stars are hidden in high places
2. **Use double jump**: Essential for reaching difficult platforms
3. **Watch the timer**: You have 400 seconds to complete the level
4. **Collect coins**: 100 coins = 1 extra life
5. **Jump on enemies**: Safer than running into them
6. **Use invincibility wisely**: Star power-ups are rare
7. **Master camera control**: Good camera angles help platforming

## 🐛 Known Limitations

- Audio uses Web Audio API synthesis (no external audio files)
- Textures are procedurally generated (no image assets)
- Single level implementation (expandable architecture)
- Basic 3D models (blocky aesthetic)

## 🔧 Customization

### Adding New Levels
Edit `src/level.js` and create a new `buildLevel2()` method following the same pattern.

### Adjusting Difficulty
Modify values in `src/player.js`:
- `speed`: Movement speed
- `jumpForce`: Jump height
- `lives`: Starting lives

### Adding New Enemies
Extend the `Enemy` class in `src/enemies.js` with new types.

### Changing Colors
Modify hex color values throughout the codebase (search for `0x` prefix).

## 📜 License

This is a fan-made educational project inspired by Nintendo's Super Mario series. All rights to the original Mario characters and concepts belong to Nintendo.

## 🙏 Credits

- Inspired by Super Mario 64 and Super Mario Galaxy
- Built with Three.js
- Created as a web-based 3D platformer demonstration

---

**Enjoy the game! 🌟**
