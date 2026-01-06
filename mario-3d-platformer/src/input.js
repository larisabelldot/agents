// Input handling for keyboard and mouse

class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            locked: false
        };
        this.canvas = null;

        this.initializeListeners();
    }

    initializeListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Prevent default for game controls
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse events
        document.addEventListener('mousemove', (e) => {
            if (this.mouse.locked) {
                this.mouse.deltaX += e.movementX || 0;
                this.mouse.deltaY += e.movementY || 0;
            }
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Pointer lock events
        document.addEventListener('pointerlockchange', () => {
            this.mouse.locked = document.pointerLockElement !== null;
        });

        document.addEventListener('pointerlockerror', () => {
            console.error('Pointer lock error');
        });
    }

    setCanvas(canvas) {
        this.canvas = canvas;

        // Request pointer lock on canvas click
        canvas.addEventListener('click', () => {
            if (!this.mouse.locked) {
                canvas.requestPointerLock();
            }
        });
    }

    // Check if key is pressed
    isKeyDown(keyCode) {
        return this.keys[keyCode] === true;
    }

    // Movement controls
    getMovementInput() {
        const movement = {
            forward: 0,
            right: 0,
            jump: false,
            run: false
        };

        // Forward/Backward
        if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) {
            movement.forward = 1;
        }
        if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) {
            movement.forward = -1;
        }

        // Left/Right
        if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) {
            movement.right = 1;
        }
        if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) {
            movement.right = -1;
        }

        // Jump
        movement.jump = this.isKeyDown('Space');

        // Run
        movement.run = this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');

        return movement;
    }

    // Get mouse delta and reset
    getMouseDelta() {
        const delta = {
            x: this.mouse.deltaX,
            y: this.mouse.deltaY
        };

        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;

        return delta;
    }

    // Check if escape is pressed (for pause)
    isPausePressed() {
        return this.isKeyDown('Escape');
    }

    // Reset all inputs
    reset() {
        this.keys = {};
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
    }
}
