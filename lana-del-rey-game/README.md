# 🌹 Lana Del Rey Song Guessing Game

A fully immersive 3D song guessing game themed around Lana Del Rey's music. Guess songs from lyric hints in a beautiful vintage cinematic environment with floating vinyl records, roses, and golden particles.

## ✨ Features

### 🎮 Game Mechanics
- **10 Questions Per Round** - Test your knowledge across Lana's discography
- **30 Song Database** - Featuring hits from all major albums:
  - Born to Die
  - Paradise
  - Ultraviolence
  - Lust for Life
  - Norman Fucking Rockwell!
  - Chemtrails over the Country Club
  - Blue Banisters
  - Did you know that there's a tunnel under Ocean Blvd

### 🎯 Three Difficulty Levels
1. **Born to Die (Easy)** - Full lyric lines
2. **Ultraviolence (Medium)** - Partial lyrics
3. **Norman Rockwell (Hard)** - One-word hints

### 💎 Power-Ups
- **Skip** (3 uses) - Skip difficult questions
- **Hint** (2 uses) - Eliminate 2 wrong answers

### 🏆 Scoring System
- **Base Score**: 100 points per correct answer
- **Time Bonus**: Up to 300 extra points (10 points per second remaining)
- **Streak Bonus**: 50 points multiplied by current streak
- **Penalty**: -50 points for wrong answers

### 🎨 3D Environment
- **Floating Vinyl Records** - Rotating vintage records
- **Rose Petals** - Animated burgundy roses
- **Golden Particles** - Sparkling star effects
- **Dynamic Lighting** - Burgundy and gold ambient lights
- **Cinematic Fog** - Depth and atmosphere

### 📱 Mobile Optimized
- **Touch Controls** - Fully responsive touch interface
- **Adaptive Layout** - Optimized for all screen sizes
- **Performance** - Smooth 60fps on mobile devices
- **Gesture Support** - Prevents unwanted zoom and scrolling

## 🎨 Design Theme

### Color Palette
- **Deep Burgundy** (`#8B2635`) - Primary color
- **Vintage Gold** (`#D4AF37`) - Accents and highlights
- **Rich Black** (`#1a1a1a`) - Background
- **Cream** (`#f5f5dc`) - Text
- **Dusty Rose** (`#9B5366`) - Secondary accent

### Typography
- **Headings**: Georgia, Times New Roman (Serif)
- **Body**: Palatino, Book Antiqua (Serif)
- **Style**: Vintage, cinematic, elegant

## 🚀 Getting Started

### Installation
Simply open `index.html` in a modern web browser. No build process required!

### Requirements
- Modern web browser with WebGL support
- JavaScript enabled
- Internet connection (for Three.js CDN)

### Quick Start
```bash
# Clone or download the game
cd lana-del-rey-game

# Open in browser (macOS)
open index.html

# Open in browser (Linux)
xdg-open index.html

# Open in browser (Windows)
start index.html
```

Or use a local server:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# Then visit: http://localhost:8000
```

## 🎮 How to Play

1. **Select Difficulty** - Choose your challenge level
2. **Read the Lyric** - Study the hint carefully
3. **Pick Your Answer** - Select from 4 song choices
4. **Beat the Clock** - Answer within 30 seconds
5. **Build Streaks** - Chain correct answers for bonus points
6. **Use Power-Ups** - Skip or get hints when stuck
7. **Set High Scores** - Aim for perfect games!

## 📊 Game Screens

### Start Screen
- Welcome message
- Difficulty selection
- Game instructions

### Game Screen
- Question counter
- 30-second timer
- Lyric hint display
- 4 answer options
- Power-up buttons
- Score & streak display

### Result Screen
- Final score
- Correct answers count
- Best streak achieved
- Performance message
- Play again / Change difficulty

## 🎯 Tips for High Scores

1. **Play on Hard Mode** - More challenging = higher bragging rights
2. **Answer Quickly** - Time bonuses add up fast
3. **Build Streaks** - Each consecutive correct answer multiplies your score
4. **Save Power-Ups** - Use hints strategically on harder questions
5. **Learn the Lyrics** - The more you play, the better you get!

## 🛠️ Technical Details

### Technologies Used
- **HTML5** - Structure and canvas
- **CSS3** - Styling, animations, responsive design
- **Vanilla JavaScript** - Game logic and interactions
- **Three.js r128** - 3D graphics and WebGL rendering

### File Structure
```
lana-del-rey-game/
├── index.html      # Main HTML structure
├── styles.css      # Vintage cinematic styling
├── game.js         # Game logic and 3D scene
└── README.md       # This file
```

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance
- Optimized for 60fps
- Efficient particle system (200 particles)
- Minimal 3D objects (3 vinyls, 5 roses)
- Adaptive pixel ratio for mobile devices
- No external assets required

## 🌟 Future Enhancements

Possible additions:
- [ ] Sound effects and music snippets
- [ ] Multiplayer mode
- [ ] Leaderboard system
- [ ] More songs and albums
- [ ] Custom difficulty settings
- [ ] Achievement system
- [ ] Social sharing
- [ ] Album art backgrounds

## 📝 Credits

### Music
All songs by **Lana Del Rey**
- Lyrics used for educational and entertainment purposes

### Design Inspiration
- Vintage Hollywood glamour
- Lana Del Rey's cinematic aesthetic
- 1960s Americana

### Technology
- Three.js for 3D graphics
- Modern web standards

## 📄 License

This is a fan-made game created for educational and entertainment purposes. All rights to Lana Del Rey's music and likeness belong to their respective owners.

## 🎵 About Lana Del Rey

Lana Del Rey is an American singer-songwriter known for her cinematic music style that draws on Americana and vintage Hollywood glamour. Her music explores themes of love, loss, tragedy, and romance, often set against the backdrop of 1950s and 1960s American culture.

---

**Enjoy the game! 🌹✨**

*"Will you still love me when I'm no longer young and beautiful?"*
