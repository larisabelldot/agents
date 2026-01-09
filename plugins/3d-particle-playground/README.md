# 3D Particle Playground

An interactive 3D particle system visualization built with Three.js. Features real-time particle animations, mouse interactions, and extensive customization options.

## Features

### Animation Modes
- **Cosmic Swirl** - Particles spiral in a mesmerizing cosmic dance
- **Ocean Wave** - Flowing wave-like particle motion
- **Explosion** - Particles burst outward and contract rhythmically
- **DNA Helix** - Double helix structure with rotating strands
- **Galaxy Spiral** - Galactic rotation with orbital dynamics
- **Fountain** - Gravity-affected particle fountain
- **Tornado** - Spinning vortex formation
- **Breathing Sphere** - Pulsating spherical particle arrangement
- **Morphing Cube** - Particles morph between sphere and cube
- **Beating Heart** - Heart-shaped particle formation with pulse

### Mouse Interaction Modes
- **Attract** - Particles are drawn toward the cursor
- **Repel** - Particles flee from the cursor
- **Orbit** - Particles orbit around the cursor position
- **Vortex** - Creates a swirling vortex effect
- **Gravity Well** - Simulates gravitational attraction

### Color Themes
- Cosmic (Purple/Blue gradient)
- Fire (Orange/Yellow gradient)
- Ocean (Cyan/Blue gradient)
- Forest (Green/Teal gradient)
- Sunset (Pink/Orange gradient)
- Neon (Magenta/Cyan gradient)
- Rainbow (Animated color cycling)
- Monochrome (White/Gray gradient)

### Controls
- **Particle Count** - Adjust from 100 to 50,000 particles
- **Particle Size** - Scale particle size from 0.5 to 10
- **Speed** - Control animation speed from 0.1x to 5x
- **Mouse Influence** - Set the radius of mouse interaction
- **Trails** - Enable/disable particle trails effect
- **Glow** - Toggle particle glow shader
- **Connections** - Show connection lines between nearby particles

### Navigation
- **Click & Drag** - Rotate the camera around the scene
- **Scroll** - Zoom in and out
- **Hide/Show Panel** - Toggle control panel visibility

### Utilities
- **Reset** - Restore all settings to defaults
- **Randomize** - Generate random combination of settings
- **Pause/Play** - Freeze or resume animation
- **Screenshot** - Download current view as PNG

## Usage

Simply open `index.html` in a modern web browser. No build process or dependencies to install - everything runs directly in the browser using Three.js from CDN.

## Browser Support

Works in all modern browsers with WebGL support:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Tips

- Reduce particle count for better performance on lower-end devices
- Disable trails and glow effects if experiencing lag
- Close other GPU-intensive applications
- Use a dedicated graphics card for best results

## Technical Details

Built with:
- **Three.js r128** - 3D rendering
- **Custom GLSL Shaders** - Particle rendering with glow effects
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern styling with backdrop blur and gradients

The particle system uses GPU-accelerated rendering with buffer geometries and custom shaders for optimal performance with up to 50,000 particles.
