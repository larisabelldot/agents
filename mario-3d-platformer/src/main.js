// Main entry point

// Global audio manager
window.audioManager = new AudioManager();

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Initialize audio on first user interaction
    const initAudio = () => {
        if (!window.audioManager.initialized) {
            window.audioManager.init();
        }
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    // Create and start game
    window.game = new Game();
    window.game.start();

    console.log('🎮 Super Mario 3D Platformer Loaded!');
    console.log('Controls:');
    console.log('  WASD / Arrow Keys - Move');
    console.log('  Space - Jump (press twice for double jump)');
    console.log('  Shift - Run');
    console.log('  Mouse - Rotate Camera');
    console.log('  ESC - Pause');
    console.log('');
    console.log('Objective: Collect all 3 stars to win!');
    console.log('Tips:');
    console.log('  • Collect 100 coins for an extra life');
    console.log('  • Jump on enemies to defeat them');
    console.log('  • Red mushrooms make you bigger');
    console.log('  • Fire flowers give you fire power');
    console.log('  • Stars make you invincible!');
});

// Prevent context menu on canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.game && window.game.state === 'playing') {
        window.game.pauseGame();
    }
});
