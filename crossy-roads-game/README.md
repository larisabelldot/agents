# Crossy Roads - 3D Mobile Game

A complete, mobile-optimized 3D endless hopping game inspired by Crossy Road, built with Three.js.

## Features

### Core Gameplay
- **Endless procedurally generated terrain** - Grass, roads, rivers, and train tracks
- **Multiple obstacle types**:
  - Cars and trucks on roads (varying speeds and colors)
  - Trains on railway tracks (with warning sounds)
  - Floating logs on rivers (rideable!)
- **Collectible coins** scattered throughout the world
- **Eagle mechanic** - Stay idle too long and an eagle will snatch you!
- **Score system** based on distance traveled

### Graphics & Effects
- **3D voxel-style graphics** using Three.js
- **Dynamic shadows** and lighting
- **Smooth hop animations** with squash and stretch
- **Particle effects** for coin collection
- **Fog effect** for depth perception
- **Character customization** - 5 different characters to choose from:
  - Chicken (classic)
  - Duck
  - Frog
  - Pig
  - Robot

### Mobile Optimized
- **Touch controls** - Swipe to move in any direction, tap to hop forward
- **Responsive design** - Works on all screen sizes
- **Safe area support** - Compatible with notched phones
- **Vibration feedback** (can be disabled)
- **Low battery friendly** - Optimized rendering

### Additional Features
- **Pause menu** with settings
- **High score tracking** (saved locally)
- **Total coins collected** (persistent)
- **Sound effects** (synthesized, no external files needed)
- **Share your score** via native share API
- **Keyboard support** for desktop play (WASD or Arrow keys)

## Controls

### Mobile
- **Swipe Up** - Hop forward
- **Swipe Down** - Hop backward
- **Swipe Left** - Hop left
- **Swipe Right** - Hop right
- **Tap** - Hop forward (quick tap)

### Desktop
- **W / Arrow Up** - Hop forward
- **S / Arrow Down** - Hop backward
- **A / Arrow Left** - Hop left
- **D / Arrow Right** - Hop right
- **P / Escape** - Pause game

## How to Play

1. **Objective**: Travel as far as possible without dying
2. **Avoid**: Cars, trucks, trains, and falling in water
3. **Use logs**: On water lanes, hop onto floating logs to cross safely
4. **Collect coins**: Earn bonus points by collecting coins
5. **Keep moving**: Stay still too long and an eagle will grab you!

## Game Over Conditions

- **Hit by a vehicle** (car or truck) on a road
- **Hit by a train** on railway tracks
- **Drowning** in water (not on a log)
- **Snatched by an eagle** (idle timeout)
- **Going out of bounds** (falling off a log at the edge)

## Technical Details

### Built With
- **Three.js r128** - 3D graphics library
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Responsive styling with modern features
- **Web Audio API** - Synthesized sound effects

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome for Android)

### Performance
- Automatic pixel ratio limiting for performance
- Efficient object pooling for obstacles
- Progressive lane generation/cleanup
- Shadow map optimization

## Local Development

1. Clone the repository
2. Start a local server:
   ```bash
   python -m http.server 8080
   ```
3. Open `http://localhost:8080` in your browser

## Deploy to Replit

This game is ready to deploy on Replit:

1. Create a new Replit
2. Import from GitHub
3. Click "Run"

The included `.replit` and `replit.nix` files handle the configuration automatically.

## File Structure

```
crossy-roads-game/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── game.js         # Complete game logic
├── .replit         # Replit configuration
├── replit.nix      # Nix dependencies
└── README.md       # This file
```

## Customization

### Adding New Characters
Edit the `characterColors` array in the `createPlayer()` method of `game.js`.

### Adjusting Difficulty
Modify the `CONFIG` object at the top of `game.js`:
- `IDLE_TIMEOUT` - Time before eagle appears
- `TERRAIN` probabilities - Frequency of different lane types
- Vehicle speeds in `createRoadLane()`

### Changing Colors
All colors are defined in `CONFIG.COLORS` in `game.js`.

## Credits

- Inspired by Crossy Road by Hipster Whale
- Built with Three.js

## License

MIT License - Feel free to use, modify, and distribute!
