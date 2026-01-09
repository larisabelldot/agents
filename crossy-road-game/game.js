// ============================================
// CROSSY ROAD - MOBILE EDITION
// Comprehensive Mobile Controls Implementation
// ============================================

// ============================================
// GAME CONFIGURATION
// ============================================
const CONFIG = {
    // Grid settings
    GRID_SIZE: 1,
    LANES: 20,
    VISIBLE_LANES: 15,

    // Player settings
    PLAYER_SIZE: 0.8,
    MOVE_DURATION: 200, // ms
    JUMP_HEIGHT: 0.5,

    // Game settings
    STARTING_LIVES: 3,
    COIN_VALUE: 10,

    // Control settings
    SWIPE_THRESHOLD: 50, // pixels
    TAP_MAX_DURATION: 200, // ms
    DOUBLE_TAP_DELAY: 300, // ms

    // Obstacle settings
    CAR_SPEED: 0.03,
    TRAIN_SPEED: 0.08,
    LOG_SPEED: 0.02,

    // Visual settings
    CAMERA_DISTANCE: 15,
    CAMERA_HEIGHT: 10,
    FOV: 60,

    // Colors
    COLORS: {
        grass: 0x4CAF50,
        road: 0x424242,
        water: 0x2196F3,
        rail: 0x795548,
        player: 0xFFEB3B,
        car: 0xF44336,
        train: 0xFF5722,
        log: 0x8D6E63,
        coin: 0xFFD700,
        safe: 0x66BB6A
    }
};

// ============================================
// GAME STATE
// ============================================
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    highScore: localStorage.getItem('crossyHighScore') || 0,
    lives: CONFIG.STARTING_LIVES,
    coins: 0,
    distance: 0,
    powerups: {
        shield: 0,
        speed: 0
    }
};

// Settings
let settings = {
    sound: true,
    music: true,
    vibration: true,
    showControls: true,
    particles: true,
    swipeSensitivity: 50
};

// ============================================
// THREE.JS SETUP
// ============================================
let scene, camera, renderer;
let player, playerTarget;
let lanes = [];
let obstacles = [];
let coins = [];
let particles = [];
let effects = [];

// Movement state
let isMoving = false;
let moveStartTime = 0;
let moveDirection = null;
let playerPosition = { x: 0, z: 0 };
let cameraOffset = 0;

// ============================================
// MOBILE CONTROLS STATE
// ============================================
let touchState = {
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTouchEnd: 0,
    isDragging: false,
    currentTouch: null
};

// ============================================
// INITIALIZE THREE.JS
// ============================================
function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 20, 50);

    // Camera
    camera = new THREE.PerspectiveCamera(
        CONFIG.FOV,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, CONFIG.CAMERA_HEIGHT, CONFIG.CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);

    // Renderer
    const canvas = document.getElementById('game-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // Create player
    createPlayer();

    // Generate initial lanes
    generateLanes();

    // Window resize handler
    window.addEventListener('resize', onWindowResize, false);
}

// ============================================
// PLAYER CREATION
// ============================================
function createPlayer() {
    const geometry = new THREE.BoxGeometry(
        CONFIG.PLAYER_SIZE,
        CONFIG.PLAYER_SIZE,
        CONFIG.PLAYER_SIZE
    );
    const material = new THREE.MeshLambertMaterial({
        color: CONFIG.COLORS.player
    });
    player = new THREE.Mesh(geometry, material);
    player.position.set(0, CONFIG.PLAYER_SIZE / 2, 0);
    player.castShadow = true;
    player.receiveShadow = true;

    // Add eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.2, 0.4);
    player.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.2, 0.4);
    player.add(rightEye);

    scene.add(player);

    playerPosition = { x: 0, z: 0 };
    playerTarget = { ...playerPosition };
}

// ============================================
// LANE GENERATION
// ============================================
function generateLanes() {
    const startZ = -Math.floor(CONFIG.LANES / 2);

    for (let i = 0; i < CONFIG.LANES; i++) {
        const z = startZ + i;
        const laneType = generateLaneType(z);
        const lane = createLane(z, laneType);
        lanes.push(lane);
        scene.add(lane.mesh);

        // Add obstacles based on lane type
        if (laneType === 'road') {
            createCars(lane);
        } else if (laneType === 'rail') {
            createTrain(lane);
        } else if (laneType === 'water') {
            createLogs(lane);
        } else if (Math.random() > 0.7) {
            createCoin(lane);
        }
    }
}

function generateLaneType(z) {
    if (z === 0) return 'safe'; // Starting position
    if (Math.abs(z) % 7 === 0) return 'safe';

    const rand = Math.random();
    if (rand < 0.4) return 'road';
    if (rand < 0.65) return 'grass';
    if (rand < 0.85) return 'water';
    return 'rail';
}

function createLane(z, type) {
    const geometry = new THREE.BoxGeometry(
        CONFIG.GRID_SIZE * 20,
        0.2,
        CONFIG.GRID_SIZE
    );

    let color = CONFIG.COLORS.grass;
    if (type === 'road') color = CONFIG.COLORS.road;
    if (type === 'water') color = CONFIG.COLORS.water;
    if (type === 'rail') color = CONFIG.COLORS.rail;
    if (type === 'safe') color = CONFIG.COLORS.safe;

    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, z * CONFIG.GRID_SIZE);
    mesh.receiveShadow = true;

    return { mesh, type, z, obstacles: [] };
}

// ============================================
// OBSTACLE CREATION
// ============================================
function createCars(lane) {
    const numCars = 2 + Math.floor(Math.random() * 3);
    const direction = Math.random() > 0.5 ? 1 : -1;

    for (let i = 0; i < numCars; i++) {
        const geometry = new THREE.BoxGeometry(1.5, 0.6, 0.8);
        const material = new THREE.MeshLambertMaterial({
            color: CONFIG.COLORS.car
        });
        const car = new THREE.Mesh(geometry, material);

        const spacing = 20 / numCars;
        car.position.set(
            (i * spacing - 10) * direction,
            0.3,
            lane.z * CONFIG.GRID_SIZE
        );
        car.castShadow = true;

        const obstacle = {
            mesh: car,
            type: 'car',
            speed: CONFIG.CAR_SPEED * direction,
            lane: lane.z,
            deadly: true
        };

        obstacles.push(obstacle);
        scene.add(car);
    }
}

function createTrain(lane) {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const geometry = new THREE.BoxGeometry(3, 1, 0.9);
    const material = new THREE.MeshLambertMaterial({
        color: CONFIG.COLORS.train
    });
    const train = new THREE.Mesh(geometry, material);

    train.position.set(
        -15 * direction,
        0.5,
        lane.z * CONFIG.GRID_SIZE
    );
    train.castShadow = true;

    const obstacle = {
        mesh: train,
        type: 'train',
        speed: CONFIG.TRAIN_SPEED * direction,
        lane: lane.z,
        deadly: true
    };

    obstacles.push(obstacle);
    scene.add(train);
}

function createLogs(lane) {
    const numLogs = 2 + Math.floor(Math.random() * 2);
    const direction = Math.random() > 0.5 ? 1 : -1;

    for (let i = 0; i < numLogs; i++) {
        const geometry = new THREE.BoxGeometry(2, 0.4, 0.7);
        const material = new THREE.MeshLambertMaterial({
            color: CONFIG.COLORS.log
        });
        const log = new THREE.Mesh(geometry, material);

        const spacing = 20 / numLogs;
        log.position.set(
            (i * spacing - 10) * direction,
            0.1,
            lane.z * CONFIG.GRID_SIZE
        );
        log.castShadow = true;

        const obstacle = {
            mesh: log,
            type: 'log',
            speed: CONFIG.LOG_SPEED * direction,
            lane: lane.z,
            deadly: false,
            platform: true
        };

        obstacles.push(obstacle);
        scene.add(log);
    }
}

function createCoin(lane) {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const material = new THREE.MeshLambertMaterial({
        color: CONFIG.COLORS.coin,
        emissive: CONFIG.COLORS.coin,
        emissiveIntensity: 0.3
    });
    const coin = new THREE.Mesh(geometry, material);

    coin.position.set(
        (Math.random() - 0.5) * 8,
        0.5,
        lane.z * CONFIG.GRID_SIZE
    );
    coin.rotation.x = Math.PI / 2;

    const coinObj = {
        mesh: coin,
        lane: lane.z,
        collected: false
    };

    coins.push(coinObj);
    scene.add(coin);
}

// ============================================
// MOBILE CONTROLS - COMPREHENSIVE IMPLEMENTATION
// ============================================

// Initialize all control systems
function initControls() {
    // 1. SWIPE GESTURE CONTROLS
    initSwipeControls();

    // 2. ON-SCREEN BUTTON CONTROLS
    initButtonControls();

    // 3. KEYBOARD CONTROLS (Desktop)
    initKeyboardControls();

    // 4. TOUCH FEEDBACK SYSTEM
    initTouchFeedback();

    // 5. VIBRATION FEEDBACK
    initVibration();

    // Update control visibility based on settings
    updateControlsVisibility();
}

// 1. SWIPE GESTURE CONTROLS
function initSwipeControls() {
    const swipeArea = document.getElementById('swipe-area');
    const canvas = document.getElementById('game-canvas');

    // Touch start
    const handleTouchStart = (e) => {
        if (!gameState.isPlaying || gameState.isPaused) return;

        const touch = e.touches[0];
        touchState.startX = touch.clientX;
        touchState.startY = touch.clientY;
        touchState.startTime = Date.now();
        touchState.isDragging = false;
        touchState.currentTouch = touch.identifier;

        showSwipeIndicator(touch.clientX, touch.clientY);
    };

    // Touch move
    const handleTouchMove = (e) => {
        if (!gameState.isPlaying || gameState.isPaused) return;
        if (touchState.currentTouch === null) return;

        e.preventDefault();

        const touch = Array.from(e.touches).find(
            t => t.identifier === touchState.currentTouch
        );
        if (!touch) return;

        const deltaX = touch.clientX - touchState.startX;
        const deltaY = touch.clientY - touchState.startY;

        updateSwipeIndicator(touch.clientX, touch.clientY, deltaX, deltaY);

        const threshold = CONFIG.SWIPE_THRESHOLD * (settings.swipeSensitivity / 50);

        if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
            touchState.isDragging = true;
        }
    };

    // Touch end
    const handleTouchEnd = (e) => {
        if (!gameState.isPlaying || gameState.isPaused) return;
        if (touchState.currentTouch === null) return;

        const touch = Array.from(e.changedTouches).find(
            t => t.identifier === touchState.currentTouch
        );
        if (!touch) return;

        const deltaX = touch.clientX - touchState.startX;
        const deltaY = touch.clientY - touchState.startY;
        const deltaTime = Date.now() - touchState.startTime;

        const threshold = CONFIG.SWIPE_THRESHOLD * (settings.swipeSensitivity / 50);

        // Detect swipe direction
        if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (absX > absY) {
                // Horizontal swipe
                if (deltaX > 0) {
                    movePlayer('right');
                } else {
                    movePlayer('left');
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    movePlayer('backward');
                } else {
                    movePlayer('forward');
                }
            }
        } else if (deltaTime < CONFIG.TAP_MAX_DURATION) {
            // Quick tap - move forward
            movePlayer('forward');
        }

        hideSwipeIndicator();
        touchState.currentTouch = null;
        touchState.isDragging = false;

        // Prevent double-tap zoom
        const now = Date.now();
        if (now - touchState.lastTouchEnd <= CONFIG.DOUBLE_TAP_DELAY) {
            e.preventDefault();
        }
        touchState.lastTouchEnd = now;
    };

    // Add event listeners
    swipeArea.addEventListener('touchstart', handleTouchStart, { passive: false });
    swipeArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    swipeArea.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
}

// 2. ON-SCREEN BUTTON CONTROLS
function initButtonControls() {
    const dpadButtons = document.querySelectorAll('.dpad-btn[data-direction]');

    dpadButtons.forEach(button => {
        const direction = button.getAttribute('data-direction');

        // Touch events for better mobile responsiveness
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!gameState.isPlaying || gameState.isPaused) return;

            button.classList.add('active');
            movePlayer(direction);
            vibrateDevice(10);
        });

        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.classList.remove('active');
        });

        // Click events for desktop
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (!gameState.isPlaying || gameState.isPaused) return;

            movePlayer(direction);
        });
    });
}

// 3. KEYBOARD CONTROLS
function initKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        if (!gameState.isPlaying || gameState.isPaused) return;
        if (isMoving) return; // Prevent multiple moves

        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                movePlayer('forward');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                movePlayer('backward');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                movePlayer('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                movePlayer('right');
                break;
            case ' ':
                e.preventDefault();
                movePlayer('forward');
                break;
        }
    });
}

// 4. TOUCH FEEDBACK SYSTEM
function initTouchFeedback() {
    // Visual feedback for touches
    document.addEventListener('touchstart', (e) => {
        Array.from(e.touches).forEach(touch => {
            createTouchRipple(touch.clientX, touch.clientY);
        });
    });
}

function createTouchRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    document.getElementById('touch-feedback').appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// 5. VIBRATION FEEDBACK
function initVibration() {
    // Vibration API support check
    window.vibrateDevice = (duration) => {
        if (!settings.vibration) return;
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    };
}

// Swipe indicator helpers
function showSwipeIndicator(x, y) {
    const indicator = document.getElementById('swipe-indicator');
    indicator.style.left = x + 'px';
    indicator.style.top = y + 'px';
    indicator.style.opacity = '1';
}

function updateSwipeIndicator(x, y, deltaX, deltaY) {
    const indicator = document.getElementById('swipe-indicator');
    indicator.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
}

function hideSwipeIndicator() {
    const indicator = document.getElementById('swipe-indicator');
    indicator.style.opacity = '0';
    indicator.style.transform = 'translate(0, 0)';
}

function updateControlsVisibility() {
    const controls = document.getElementById('mobile-controls');
    if (controls) {
        controls.style.display = settings.showControls ? 'block' : 'none';
    }
}

// ============================================
// PLAYER MOVEMENT
// ============================================
function movePlayer(direction) {
    if (isMoving || !gameState.isPlaying || gameState.isPaused) return;

    const oldPos = { ...playerPosition };

    switch(direction) {
        case 'forward':
            playerTarget.z -= 1;
            break;
        case 'backward':
            playerTarget.z += 1;
            break;
        case 'left':
            playerTarget.x -= 1;
            break;
        case 'right':
            playerTarget.x += 1;
            break;
    }

    // Boundary check
    if (Math.abs(playerTarget.x) > 9) {
        playerTarget.x = oldPos.x;
        return;
    }

    isMoving = true;
    moveStartTime = Date.now();
    moveDirection = direction;

    // Rotate player
    const rotations = {
        'forward': 0,
        'right': -Math.PI / 2,
        'backward': Math.PI,
        'left': Math.PI / 2
    };
    player.rotation.y = rotations[direction];

    // Update score for forward movement
    if (direction === 'forward' && playerTarget.z < playerPosition.z) {
        gameState.score += 1;
        gameState.distance += 1;
        updateScore();

        // Generate new lanes ahead
        if (playerTarget.z < lanes[0].z + 5) {
            generateNewLane();
        }
    }

    // Vibration feedback
    vibrateDevice(10);

    // Sound effect
    playSound('hop');
}

function updatePlayerMovement() {
    if (!isMoving) return;

    const elapsed = Date.now() - moveStartTime;
    const progress = Math.min(elapsed / CONFIG.MOVE_DURATION, 1);

    // Smooth interpolation
    const easeProgress = easeOutQuad(progress);

    playerPosition.x = lerp(playerPosition.x, playerTarget.x, easeProgress);
    playerPosition.z = lerp(playerPosition.z, playerTarget.z, easeProgress);

    player.position.x = playerPosition.x * CONFIG.GRID_SIZE;
    player.position.z = playerPosition.z * CONFIG.GRID_SIZE;

    // Jump animation
    const jumpProgress = Math.sin(progress * Math.PI);
    player.position.y = CONFIG.PLAYER_SIZE / 2 + jumpProgress * CONFIG.JUMP_HEIGHT;

    // Complete movement
    if (progress >= 1) {
        isMoving = false;
        playerPosition.x = playerTarget.x;
        playerPosition.z = playerTarget.z;
        player.position.x = playerPosition.x * CONFIG.GRID_SIZE;
        player.position.z = playerPosition.z * CONFIG.GRID_SIZE;
        player.position.y = CONFIG.PLAYER_SIZE / 2;

        checkCollisions();
    }
}

// ============================================
// COLLISION DETECTION
// ============================================
function checkCollisions() {
    const currentLane = lanes.find(lane => lane.z === playerPosition.z);
    if (!currentLane) return;

    // Check if in water without log
    if (currentLane.type === 'water') {
        const onLog = obstacles.some(obs => {
            if (obs.type !== 'log' || obs.lane !== playerPosition.z) return false;
            const distance = Math.abs(obs.mesh.position.x - player.position.x);
            return distance < 1.5;
        });

        if (!onLog) {
            playerDie('drowned');
            return;
        } else {
            // Move with log
            const log = obstacles.find(obs => {
                if (obs.type !== 'log' || obs.lane !== playerPosition.z) return false;
                const distance = Math.abs(obs.mesh.position.x - player.position.x);
                return distance < 1.5;
            });
            if (log) {
                playerPosition.x += log.speed;
                playerTarget.x = playerPosition.x;
                player.position.x = playerPosition.x * CONFIG.GRID_SIZE;

                // Check if pushed off edge
                if (Math.abs(playerPosition.x) > 9) {
                    playerDie('fell');
                }
            }
        }
    }

    // Check obstacle collisions
    obstacles.forEach(obs => {
        if (!obs.deadly || obs.lane !== playerPosition.z) return;

        const distance = Math.abs(obs.mesh.position.x - player.position.x);
        if (distance < 1) {
            playerDie('hit');
        }
    });

    // Check coin collection
    coins.forEach(coin => {
        if (coin.collected || coin.lane !== playerPosition.z) return;

        const distance = Math.abs(coin.mesh.position.x - player.position.x);
        if (distance < 0.8) {
            collectCoin(coin);
        }
    });
}

function collectCoin(coin) {
    coin.collected = true;
    scene.remove(coin.mesh);

    gameState.coins += 1;
    gameState.score += CONFIG.COIN_VALUE;
    updateScore();

    createParticleEffect(coin.mesh.position, CONFIG.COLORS.coin);
    playSound('coin');
    vibrateDevice(20);
}

function playerDie(reason) {
    gameState.lives -= 1;
    updateLives();

    createParticleEffect(player.position, CONFIG.COLORS.player);
    playSound('die');
    vibrateDevice([100, 50, 100]);

    if (gameState.lives <= 0) {
        gameOver();
    } else {
        // Respawn
        setTimeout(() => {
            resetPlayerPosition();
        }, 500);
    }
}

function resetPlayerPosition() {
    playerPosition = { x: 0, z: 0 };
    playerTarget = { ...playerPosition };
    player.position.set(0, CONFIG.PLAYER_SIZE / 2, 0);
}

// ============================================
// OBSTACLE UPDATES
// ============================================
function updateObstacles() {
    obstacles.forEach(obs => {
        obs.mesh.position.x += obs.speed;

        // Wrap around
        if (obs.mesh.position.x > 15) {
            obs.mesh.position.x = -15;
        } else if (obs.mesh.position.x < -15) {
            obs.mesh.position.x = 15;
        }
    });
}

// ============================================
// LANE GENERATION (Procedural)
// ============================================
function generateNewLane() {
    // Remove old lanes
    const oldLane = lanes.pop();
    scene.remove(oldLane.mesh);

    // Remove associated obstacles
    obstacles = obstacles.filter(obs => {
        if (obs.lane === oldLane.z) {
            scene.remove(obs.mesh);
            return false;
        }
        return true;
    });

    // Remove associated coins
    coins = coins.filter(coin => {
        if (coin.lane === oldLane.z) {
            scene.remove(coin.mesh);
            return false;
        }
        return true;
    });

    // Create new lane
    const newZ = lanes[0].z - 1;
    const laneType = generateLaneType(newZ);
    const lane = createLane(newZ, laneType);
    lanes.unshift(lane);
    scene.add(lane.mesh);

    // Add obstacles
    if (laneType === 'road') {
        createCars(lane);
    } else if (laneType === 'rail') {
        createTrain(lane);
    } else if (laneType === 'water') {
        createLogs(lane);
    } else if (Math.random() > 0.6) {
        createCoin(lane);
    }
}

// ============================================
// CAMERA UPDATES
// ============================================
function updateCamera() {
    const targetZ = playerPosition.z * CONFIG.GRID_SIZE + CONFIG.CAMERA_DISTANCE;
    cameraOffset = lerp(cameraOffset, playerPosition.z * CONFIG.GRID_SIZE, 0.1);

    camera.position.z = cameraOffset + CONFIG.CAMERA_DISTANCE;
    camera.lookAt(0, 0, cameraOffset);
}

// ============================================
// PARTICLE EFFECTS
// ============================================
function createParticleEffect(position, color) {
    if (!settings.particles) return;

    for (let i = 0; i < 20; i++) {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ color });
        const particle = new THREE.Mesh(geometry, material);

        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            Math.random() * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        particle.life = 1.0;

        effects.push(particle);
        scene.add(particle);
    }
}

function updateEffects() {
    effects.forEach((particle, index) => {
        particle.position.add(particle.velocity);
        particle.velocity.y -= 0.01; // Gravity
        particle.life -= 0.02;
        particle.material.opacity = particle.life;

        if (particle.life <= 0) {
            scene.remove(particle);
            effects.splice(index, 1);
        }
    });
}

// ============================================
// COIN ANIMATION
// ============================================
function animateCoins() {
    coins.forEach(coin => {
        if (coin.collected) return;
        coin.mesh.rotation.z += 0.05;
        coin.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
    });
}

// ============================================
// GAME LOOP
// ============================================
function animate() {
    requestAnimationFrame(animate);

    if (!gameState.isPlaying || gameState.isPaused) return;

    updatePlayerMovement();
    updateObstacles();
    updateCamera();
    updateEffects();
    animateCoins();

    renderer.render(scene, camera);
}

// ============================================
// UI UPDATES
// ============================================
function updateScore() {
    document.getElementById('score').textContent = gameState.score;

    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('crossyHighScore', gameState.highScore);
        document.getElementById('high-score').textContent = gameState.highScore;
    }
}

function updateLives() {
    const livesDisplay = document.getElementById('lives-display');
    livesDisplay.innerHTML = '';

    for (let i = 0; i < gameState.lives; i++) {
        const life = document.createElement('span');
        life.className = 'life';
        life.textContent = '❤️';
        livesDisplay.appendChild(life);
    }
}

// ============================================
// GAME STATES
// ============================================
function startGame() {
    gameState = {
        isPlaying: true,
        isPaused: false,
        score: 0,
        highScore: localStorage.getItem('crossyHighScore') || 0,
        lives: CONFIG.STARTING_LIVES,
        coins: 0,
        distance: 0,
        powerups: { shield: 0, speed: 0 }
    };

    // Reset world
    obstacles.forEach(obs => scene.remove(obs.mesh));
    coins.forEach(coin => scene.remove(coin.mesh));
    lanes.forEach(lane => scene.remove(lane.mesh));
    effects.forEach(particle => scene.remove(particle));

    obstacles = [];
    coins = [];
    lanes = [];
    effects = [];

    resetPlayerPosition();
    generateLanes();

    // Update UI
    updateScore();
    updateLives();
    document.getElementById('high-score').textContent = gameState.highScore;

    showScreen('game-hud');
    hideScreen('start-screen');

    playSound('start');
}

function pauseGame() {
    gameState.isPaused = true;
    showScreen('pause-screen');
}

function resumeGame() {
    gameState.isPaused = false;
    hideScreen('pause-screen');
}

function gameOver() {
    gameState.isPlaying = false;

    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-high-score').textContent = gameState.highScore;
    document.getElementById('final-distance').textContent = gameState.distance;
    document.getElementById('final-coins').textContent = gameState.coins;

    showScreen('gameover-screen');
    playSound('gameover');
}

// ============================================
// SCREEN MANAGEMENT
// ============================================
function showScreen(screenId) {
    document.getElementById(screenId).classList.add('active');
}

function hideScreen(screenId) {
    document.getElementById(screenId).classList.remove('active');
}

// ============================================
// SOUND SYSTEM (Placeholder)
// ============================================
function playSound(soundName) {
    if (!settings.sound) return;
    // Implement Web Audio API sounds here
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function lerp(start, end, t) {
    return start + (end - start) * t;
}

function easeOutQuad(t) {
    return t * (2 - t);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// UI EVENT LISTENERS
// ============================================
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('controls-btn').addEventListener('click', () => {
    hideScreen('start-screen');
    showScreen('controls-screen');
});
document.getElementById('settings-btn').addEventListener('click', () => {
    hideScreen('start-screen');
    showScreen('settings-screen');
});
document.getElementById('controls-back-btn').addEventListener('click', () => {
    hideScreen('controls-screen');
    showScreen('start-screen');
});
document.getElementById('settings-back-btn').addEventListener('click', () => {
    hideScreen('settings-screen');
    showScreen('start-screen');
});
document.getElementById('pause-btn').addEventListener('click', pauseGame);
document.getElementById('resume-btn').addEventListener('click', resumeGame);
document.getElementById('restart-btn').addEventListener('click', () => {
    hideScreen('pause-screen');
    startGame();
});
document.getElementById('quit-btn').addEventListener('click', () => {
    hideScreen('pause-screen');
    hideScreen('game-hud');
    showScreen('start-screen');
    gameState.isPlaying = false;
});
document.getElementById('play-again-btn').addEventListener('click', () => {
    hideScreen('gameover-screen');
    startGame();
});
document.getElementById('menu-btn').addEventListener('click', () => {
    hideScreen('gameover-screen');
    hideScreen('game-hud');
    showScreen('start-screen');
});

// Settings listeners
document.getElementById('sound-toggle').addEventListener('change', (e) => {
    settings.sound = e.target.checked;
});
document.getElementById('music-toggle').addEventListener('change', (e) => {
    settings.music = e.target.checked;
});
document.getElementById('vibration-toggle').addEventListener('change', (e) => {
    settings.vibration = e.target.checked;
});
document.getElementById('controls-toggle').addEventListener('change', (e) => {
    settings.showControls = e.target.checked;
    updateControlsVisibility();
});
document.getElementById('particles-toggle').addEventListener('change', (e) => {
    settings.particles = e.target.checked;
});
document.getElementById('sensitivity-slider').addEventListener('input', (e) => {
    settings.swipeSensitivity = parseInt(e.target.value);
});

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener('load', () => {
    hideScreen('loading-screen');
    initThreeJS();
    initControls();
    animate();
});
