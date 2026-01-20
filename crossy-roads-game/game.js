/**
 * CROSSY ROADS - Complete 3D Mobile Game
 * A full-featured Crossy Road clone using Three.js
 */

// ============================================
// GAME CONFIGURATION
// ============================================
const CONFIG = {
    // World settings
    LANE_WIDTH: 1,
    VISIBLE_LANES: 20,
    LANES_BEHIND: 5,
    WORLD_WIDTH: 15,

    // Player settings
    PLAYER_SPEED: 0.15,
    HOP_HEIGHT: 0.5,
    HOP_DURATION: 150,
    IDLE_TIMEOUT: 7000,

    // Game settings
    INITIAL_SPEED: 0.02,
    MAX_SPEED: 0.05,
    SPEED_INCREMENT: 0.0001,
    COIN_VALUE: 1,

    // Terrain probabilities
    TERRAIN: {
        GRASS: 0.35,
        ROAD: 0.35,
        WATER: 0.15,
        RAIL: 0.15
    },

    // Colors (voxel style)
    COLORS: {
        GRASS_LIGHT: 0x7CB342,
        GRASS_DARK: 0x689F38,
        ROAD: 0x424242,
        ROAD_LINES: 0xFFFFFF,
        WATER: 0x29B6F6,
        WATER_DEEP: 0x0288D1,
        RAIL: 0x795548,
        RAIL_METAL: 0x9E9E9E,
        SKY: 0x87CEEB,
        TREE_TRUNK: 0x795548,
        TREE_LEAVES: 0x4CAF50,
        ROCK: 0x757575,
        COIN: 0xFFD700,
        CHICKEN_BODY: 0xFFFFFF,
        CHICKEN_BEAK: 0xFFC107,
        CHICKEN_COMB: 0xF44336,
        CAR_COLORS: [0xF44336, 0x2196F3, 0xFFEB3B, 0x4CAF50, 0x9C27B0, 0xFF9800],
        TRUCK_COLORS: [0x1565C0, 0xC62828, 0x2E7D32, 0x6A1B9A],
        LOG: 0x8D6E63,
        TRAIN: 0x37474F,
        LILY_PAD: 0x4CAF50
    }
};

// ============================================
// GAME STATE
// ============================================
const GameState = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover'
};

// ============================================
// MAIN GAME CLASS
// ============================================
class CrossyRoadsGame {
    constructor() {
        this.state = GameState.LOADING;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('crossyHighScore')) || 0;
        this.coins = 0;
        this.totalCoins = parseInt(localStorage.getItem('crossyTotalCoins')) || 0;
        this.maxZ = 0;
        this.currentCharacter = 0;
        this.characters = ['Chicken', 'Duck', 'Frog', 'Pig', 'Robot'];

        // Settings
        this.soundEnabled = localStorage.getItem('crossySound') !== 'false';
        this.musicEnabled = localStorage.getItem('crossyMusic') !== 'false';
        this.vibrationEnabled = localStorage.getItem('crossyVibration') !== 'false';

        // Game objects
        this.player = null;
        this.lanes = [];
        this.obstacles = [];
        this.coins3D = [];
        this.decorations = [];

        // Movement
        this.isMoving = false;
        this.moveQueue = [];
        this.lastMoveTime = 0;
        this.idleTimer = null;
        this.eagle = null;
        this.eagleWarning = false;

        // Touch handling
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;

        // Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;

        // Initialize
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    async init() {
        await this.loadAssets();
        this.setupThreeJS();
        this.setupEventListeners();
        this.setupUI();
        this.updateLoadingProgress(100);

        setTimeout(() => {
            this.hideLoading();
            this.showMenu();
        }, 500);
    }

    async loadAssets() {
        const tips = [
            "Tip: Swipe to move!",
            "Tip: Watch out for trains!",
            "Tip: Collect coins for points!",
            "Tip: Don't stay idle too long!",
            "Tip: Logs float on water!"
        ];

        document.getElementById('loading-tip').textContent =
            tips[Math.floor(Math.random() * tips.length)];

        // Simulate loading
        for (let i = 0; i <= 90; i += 10) {
            this.updateLoadingProgress(i);
            await this.delay(100);
        }
    }

    updateLoadingProgress(percent) {
        const progress = document.getElementById('loading-progress');
        if (progress) {
            progress.style.width = percent + '%';
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
        document.getElementById('game-container').classList.remove('hidden');
    }

    // ============================================
    // THREE.JS SETUP
    // ============================================
    setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.COLORS.SKY);
        this.scene.fog = new THREE.Fog(CONFIG.COLORS.SKY, 15, 35);

        // Camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
        this.camera.position.set(0, 10, -8);
        this.camera.lookAt(0, 0, 5);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting
        this.setupLighting();

        // Clock
        this.clock = new THREE.Clock();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());

        // Start render loop
        this.animate();
    }

    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        // Directional light (sun)
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(10, 20, 10);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 50;
        sun.shadow.camera.left = -20;
        sun.shadow.camera.right = 20;
        sun.shadow.camera.top = 20;
        sun.shadow.camera.bottom = -20;
        this.scene.add(sun);
        this.sun = sun;

        // Hemisphere light for better ambient
        const hemi = new THREE.HemisphereLight(0x87CEEB, 0x7CB342, 0.3);
        this.scene.add(hemi);
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // ============================================
    // UI SETUP
    // ============================================
    setupUI() {
        // Update displayed stats
        this.updateUIStats();

        // Character preview
        this.updateCharacterPreview();
    }

    updateUIStats() {
        document.getElementById('menu-high-score').textContent = this.highScore;
        document.getElementById('total-coins').textContent = this.totalCoins;
        document.getElementById('high-score').textContent = this.highScore;
    }

    updateCharacterPreview() {
        const preview = document.getElementById('character-preview');
        const name = document.getElementById('character-name');

        // Create mini character preview
        const colors = [
            { body: '#FFFFFF', accent: '#F44336' }, // Chicken
            { body: '#FFEB3B', accent: '#FF9800' }, // Duck
            { body: '#4CAF50', accent: '#8BC34A' }, // Frog
            { body: '#FFCDD2', accent: '#F48FB1' }, // Pig
            { body: '#90A4AE', accent: '#42A5F5' }  // Robot
        ];

        const color = colors[this.currentCharacter];
        preview.innerHTML = `
            <svg width="60" height="60" viewBox="0 0 60 60">
                <rect x="15" y="20" width="30" height="30" rx="5" fill="${color.body}"/>
                <circle cx="25" cy="30" r="3" fill="#333"/>
                <circle cx="35" cy="30" r="3" fill="#333"/>
                <rect x="25" y="38" width="10" height="5" fill="${color.accent}"/>
                <rect x="20" y="10" width="8" height="12" fill="${color.accent}"/>
            </svg>
        `;
        name.textContent = this.characters[this.currentCharacter];
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    setupEventListeners() {
        // Menu buttons
        document.getElementById('play-btn').addEventListener('click', () => this.startGame());
        document.getElementById('char-prev').addEventListener('click', () => this.prevCharacter());
        document.getElementById('char-next').addEventListener('click', () => this.nextCharacter());

        // Pause buttons
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitToMenu());

        // Game over buttons
        document.getElementById('retry-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('home-btn').addEventListener('click', () => this.quitToMenu());
        document.getElementById('share-btn').addEventListener('click', () => this.shareScore());

        // Settings toggles
        document.getElementById('sound-toggle').addEventListener('click', (e) => this.toggleSetting(e, 'sound'));
        document.getElementById('music-toggle').addEventListener('click', (e) => this.toggleSetting(e, 'music'));
        document.getElementById('vibration-toggle').addEventListener('click', (e) => this.toggleSetting(e, 'vibration'));

        // Touch controls
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });

        // Mouse controls (for desktop testing)
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e));

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state === GameState.PLAYING) {
                this.pauseGame();
            }
        });
    }

    // ============================================
    // CHARACTER SELECTION
    // ============================================
    prevCharacter() {
        this.currentCharacter = (this.currentCharacter - 1 + this.characters.length) % this.characters.length;
        this.updateCharacterPreview();
        this.playSound('hop');
    }

    nextCharacter() {
        this.currentCharacter = (this.currentCharacter + 1) % this.characters.length;
        this.updateCharacterPreview();
        this.playSound('hop');
    }

    // ============================================
    // GAME STATE MANAGEMENT
    // ============================================
    showMenu() {
        this.state = GameState.MENU;
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('game-hud').classList.add('hidden');

        // Create menu background scene
        this.createMenuScene();
    }

    createMenuScene() {
        // Clear scene
        this.clearScene();

        // Add some decorative elements
        for (let z = -5; z < 15; z++) {
            const isGrass = Math.random() > 0.3;
            const lane = this.createGrassLane(z);
            this.scene.add(lane);

            if (isGrass && Math.random() > 0.5) {
                const tree = this.createTree();
                tree.position.set(
                    (Math.random() - 0.5) * 10,
                    0,
                    z
                );
                this.scene.add(tree);
            }
        }

        // Add a display chicken
        const chicken = this.createPlayer();
        chicken.position.set(0, 0.3, 3);
        this.scene.add(chicken);
        this.menuChicken = chicken;
    }

    startGame() {
        this.state = GameState.PLAYING;
        this.score = 0;
        this.coins = 0;
        this.maxZ = 0;

        // Hide menu, show HUD
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-hud').classList.remove('hidden');

        // Update HUD
        this.updateHUD();

        // Clear and setup game scene
        this.clearScene();
        this.setupGameScene();

        // Reset idle timer
        this.resetIdleTimer();

        // Play background music
        if (this.musicEnabled) {
            // Background music would play here
        }

        this.playSound('hop');
    }

    pauseGame() {
        if (this.state !== GameState.PLAYING) return;

        this.state = GameState.PAUSED;
        document.getElementById('pause-screen').classList.remove('hidden');
        document.getElementById('pause-score').textContent = this.score;
        document.getElementById('pause-coins').textContent = this.coins;

        if (this.idleTimer) clearTimeout(this.idleTimer);
    }

    resumeGame() {
        if (this.state !== GameState.PAUSED) return;

        this.state = GameState.PLAYING;
        document.getElementById('pause-screen').classList.add('hidden');
        this.resetIdleTimer();
    }

    restartGame() {
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        this.startGame();
    }

    quitToMenu() {
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        this.showMenu();
    }

    gameOver(reason = 'hit') {
        if (this.state !== GameState.PLAYING) return;

        this.state = GameState.GAMEOVER;

        // Update stats
        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            localStorage.setItem('crossyHighScore', this.highScore);
        }

        this.totalCoins += this.coins;
        localStorage.setItem('crossyTotalCoins', this.totalCoins);

        // Show death reason
        this.showDeathReason(reason);

        // Vibrate
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        // Play death sound
        this.playSound('hit');

        // Show game over screen after delay
        setTimeout(() => {
            document.getElementById('death-reason').classList.add('hidden');
            document.getElementById('gameover-screen').classList.remove('hidden');
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('final-coins').textContent = this.coins;
            document.getElementById('final-best').textContent = this.highScore;

            if (isNewRecord) {
                document.getElementById('new-record').classList.remove('hidden');
            } else {
                document.getElementById('new-record').classList.add('hidden');
            }

            // Set death icon based on reason
            const icons = {
                'hit': '🚗',
                'water': '💀',
                'train': '🚂',
                'eagle': '🦅'
            };
            document.getElementById('death-icon').textContent = icons[reason] || '💀';
        }, 1500);

        if (this.idleTimer) clearTimeout(this.idleTimer);
    }

    showDeathReason(reason) {
        const reasons = {
            'hit': 'SQUISHED!',
            'water': 'DROWNED!',
            'train': 'TRAIN HIT!',
            'eagle': 'SNATCHED!'
        };

        document.getElementById('death-text').textContent = reasons[reason] || 'GAME OVER';
        document.getElementById('death-reason').classList.remove('hidden');
    }

    // ============================================
    // SCENE SETUP
    // ============================================
    clearScene() {
        while (this.scene.children.length > 0) {
            const obj = this.scene.children[0];
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        }

        this.lanes = [];
        this.obstacles = [];
        this.coins3D = [];
        this.decorations = [];

        // Re-add lighting
        this.setupLighting();
    }

    setupGameScene() {
        // Create player
        this.player = this.createPlayer();
        this.player.position.set(0, 0.3, 0);
        this.player.userData.targetX = 0;
        this.player.userData.targetZ = 0;
        this.player.userData.currentLane = null;
        this.scene.add(this.player);

        // Generate initial lanes
        for (let z = -CONFIG.LANES_BEHIND; z < CONFIG.VISIBLE_LANES; z++) {
            this.generateLane(z);
        }

        // Update camera
        this.updateCamera(true);
    }

    // ============================================
    // PLAYER CREATION
    // ============================================
    createPlayer() {
        const group = new THREE.Group();

        // Character colors based on selection
        const characterColors = [
            { body: 0xFFFFFF, accent: 0xF44336, beak: 0xFFC107 }, // Chicken
            { body: 0xFFEB3B, accent: 0xFF9800, beak: 0xFF9800 }, // Duck
            { body: 0x4CAF50, accent: 0x8BC34A, beak: 0xF44336 }, // Frog
            { body: 0xFFCDD2, accent: 0xF48FB1, beak: 0xF48FB1 }, // Pig
            { body: 0x90A4AE, accent: 0x42A5F5, beak: 0x42A5F5 }  // Robot
        ];

        const colors = characterColors[this.currentCharacter];

        // Body
        const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.4);
        const bodyMat = new THREE.MeshLambertMaterial({ color: colors.body });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.25;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Head/Comb
        const combGeo = new THREE.BoxGeometry(0.15, 0.2, 0.1);
        const combMat = new THREE.MeshLambertMaterial({ color: colors.accent });
        const comb = new THREE.Mesh(combGeo, combMat);
        comb.position.set(0, 0.6, 0);
        comb.castShadow = true;
        group.add(comb);

        // Eyes
        const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.05);
        const eyeMat = new THREE.MeshLambertMaterial({ color: 0x000000 });

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.12, 0.35, 0.2);
        group.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.12, 0.35, 0.2);
        group.add(rightEye);

        // Beak
        const beakGeo = new THREE.BoxGeometry(0.15, 0.1, 0.15);
        const beakMat = new THREE.MeshLambertMaterial({ color: colors.beak });
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.position.set(0, 0.25, 0.25);
        beak.castShadow = true;
        group.add(beak);

        // Wings (small boxes on sides)
        const wingGeo = new THREE.BoxGeometry(0.1, 0.25, 0.2);
        const wingMat = new THREE.MeshLambertMaterial({ color: colors.body });

        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-0.3, 0.25, 0);
        leftWing.castShadow = true;
        group.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(0.3, 0.25, 0);
        rightWing.castShadow = true;
        group.add(rightWing);

        // Feet
        const footGeo = new THREE.BoxGeometry(0.12, 0.05, 0.15);
        const footMat = new THREE.MeshLambertMaterial({ color: colors.beak });

        const leftFoot = new THREE.Mesh(footGeo, footMat);
        leftFoot.position.set(-0.12, 0, 0.05);
        group.add(leftFoot);

        const rightFoot = new THREE.Mesh(footGeo, footMat);
        rightFoot.position.set(0.12, 0, 0.05);
        group.add(rightFoot);

        group.scale.set(0.8, 0.8, 0.8);

        return group;
    }

    // ============================================
    // LANE GENERATION
    // ============================================
    generateLane(z) {
        // First few lanes are always grass
        let laneType;
        if (z < 3) {
            laneType = 'grass';
        } else {
            const rand = Math.random();
            const cumulative = CONFIG.TERRAIN;

            if (rand < cumulative.GRASS) {
                laneType = 'grass';
            } else if (rand < cumulative.GRASS + cumulative.ROAD) {
                laneType = 'road';
            } else if (rand < cumulative.GRASS + cumulative.ROAD + cumulative.WATER) {
                laneType = 'water';
            } else {
                laneType = 'rail';
            }
        }

        let lane;
        switch (laneType) {
            case 'grass':
                lane = this.createGrassLane(z);
                break;
            case 'road':
                lane = this.createRoadLane(z);
                break;
            case 'water':
                lane = this.createWaterLane(z);
                break;
            case 'rail':
                lane = this.createRailLane(z);
                break;
        }

        lane.userData.type = laneType;
        lane.userData.z = z;
        this.lanes.push(lane);
        this.scene.add(lane);

        // Add coin chance
        if (z > 2 && Math.random() < 0.15) {
            this.addCoin(z, laneType);
        }

        return lane;
    }

    createGrassLane(z) {
        const group = new THREE.Group();

        // Ground
        const isLight = z % 2 === 0;
        const groundGeo = new THREE.BoxGeometry(CONFIG.WORLD_WIDTH, 0.2, CONFIG.LANE_WIDTH);
        const groundMat = new THREE.MeshLambertMaterial({
            color: isLight ? CONFIG.COLORS.GRASS_LIGHT : CONFIG.COLORS.GRASS_DARK
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.set(0, -0.1, z);
        ground.receiveShadow = true;
        group.add(ground);

        // Add trees and rocks
        const numDecorations = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numDecorations; i++) {
            const x = (Math.random() - 0.5) * (CONFIG.WORLD_WIDTH - 2);

            // Don't place decorations in the middle path
            if (Math.abs(x) < 2) continue;

            if (Math.random() > 0.3) {
                const tree = this.createTree();
                tree.position.set(x, 0, z);
                group.add(tree);
                this.decorations.push({ mesh: tree, blocking: true, x, z });
            } else {
                const rock = this.createRock();
                rock.position.set(x, 0, z);
                group.add(rock);
                this.decorations.push({ mesh: rock, blocking: true, x, z });
            }
        }

        return group;
    }

    createRoadLane(z) {
        const group = new THREE.Group();

        // Road surface
        const roadGeo = new THREE.BoxGeometry(CONFIG.WORLD_WIDTH, 0.15, CONFIG.LANE_WIDTH);
        const roadMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.ROAD });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.position.set(0, -0.075, z);
        road.receiveShadow = true;
        group.add(road);

        // Road lines
        const lineGeo = new THREE.BoxGeometry(0.3, 0.01, 0.08);
        const lineMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.ROAD_LINES });

        for (let x = -CONFIG.WORLD_WIDTH / 2 + 0.5; x < CONFIG.WORLD_WIDTH / 2; x += 1) {
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.position.set(x, 0.01, z);
            group.add(line);
        }

        // Add vehicles
        const direction = Math.random() > 0.5 ? 1 : -1;
        const speed = (Math.random() * 0.03 + 0.02) * direction;
        const numVehicles = Math.floor(Math.random() * 3) + 2;
        const spacing = CONFIG.WORLD_WIDTH / numVehicles;

        for (let i = 0; i < numVehicles; i++) {
            const vehicle = Math.random() > 0.7 ? this.createTruck() : this.createCar();
            const startX = -CONFIG.WORLD_WIDTH / 2 + i * spacing + Math.random() * spacing * 0.5;
            vehicle.position.set(startX, 0.15, z);
            vehicle.rotation.y = direction > 0 ? 0 : Math.PI;
            group.add(vehicle);

            this.obstacles.push({
                mesh: vehicle,
                type: 'vehicle',
                speed: speed,
                z: z,
                width: vehicle.userData.width || 1
            });
        }

        return group;
    }

    createWaterLane(z) {
        const group = new THREE.Group();

        // Water surface
        const waterGeo = new THREE.BoxGeometry(CONFIG.WORLD_WIDTH, 0.1, CONFIG.LANE_WIDTH);
        const waterMat = new THREE.MeshLambertMaterial({
            color: CONFIG.COLORS.WATER,
            transparent: true,
            opacity: 0.8
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.position.set(0, -0.15, z);
        water.receiveShadow = true;
        group.add(water);

        // Deep water underneath
        const deepGeo = new THREE.BoxGeometry(CONFIG.WORLD_WIDTH, 0.3, CONFIG.LANE_WIDTH);
        const deepMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.WATER_DEEP });
        const deep = new THREE.Mesh(deepGeo, deepMat);
        deep.position.set(0, -0.35, z);
        group.add(deep);

        // Add logs and lily pads
        const direction = Math.random() > 0.5 ? 1 : -1;
        const speed = (Math.random() * 0.015 + 0.01) * direction;
        const numLogs = Math.floor(Math.random() * 3) + 2;
        const spacing = CONFIG.WORLD_WIDTH / numLogs;

        for (let i = 0; i < numLogs; i++) {
            const logLength = Math.floor(Math.random() * 2) + 2;
            const log = this.createLog(logLength);
            const startX = -CONFIG.WORLD_WIDTH / 2 + i * spacing + Math.random() * spacing * 0.3;
            log.position.set(startX, 0, z);
            group.add(log);

            this.obstacles.push({
                mesh: log,
                type: 'log',
                speed: speed,
                z: z,
                width: logLength * 0.5,
                rideable: true
            });
        }

        return group;
    }

    createRailLane(z) {
        const group = new THREE.Group();

        // Ground
        const groundGeo = new THREE.BoxGeometry(CONFIG.WORLD_WIDTH, 0.15, CONFIG.LANE_WIDTH);
        const groundMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.RAIL });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.set(0, -0.075, z);
        ground.receiveShadow = true;
        group.add(ground);

        // Rails
        const railGeo = new THREE.BoxGeometry(CONFIG.WORLD_WIDTH, 0.08, 0.08);
        const railMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.RAIL_METAL });

        const rail1 = new THREE.Mesh(railGeo, railMat);
        rail1.position.set(0, 0.04, z - 0.2);
        group.add(rail1);

        const rail2 = new THREE.Mesh(railGeo, railMat);
        rail2.position.set(0, 0.04, z + 0.2);
        group.add(rail2);

        // Railroad ties
        const tieGeo = new THREE.BoxGeometry(0.15, 0.05, 0.7);
        const tieMat = new THREE.MeshLambertMaterial({ color: 0x4E342E });

        for (let x = -CONFIG.WORLD_WIDTH / 2 + 0.3; x < CONFIG.WORLD_WIDTH / 2; x += 0.6) {
            const tie = new THREE.Mesh(tieGeo, tieMat);
            tie.position.set(x, 0.01, z);
            group.add(tie);
        }

        // Train setup
        const direction = Math.random() > 0.5 ? 1 : -1;
        group.userData.trainDirection = direction;
        group.userData.trainTimer = Math.random() * 3000 + 2000;
        group.userData.hasActiveTrain = false;
        group.userData.warningActive = false;

        return group;
    }

    // ============================================
    // OBJECT CREATION
    // ============================================
    createTree() {
        const group = new THREE.Group();

        // Trunk
        const trunkGeo = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const trunkMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.TREE_TRUNK });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.4;
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        group.add(trunk);

        // Leaves (stacked boxes for voxel look)
        const leafMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.TREE_LEAVES });

        const leaf1Geo = new THREE.BoxGeometry(0.9, 0.5, 0.9);
        const leaf1 = new THREE.Mesh(leaf1Geo, leafMat);
        leaf1.position.y = 1.0;
        leaf1.castShadow = true;
        group.add(leaf1);

        const leaf2Geo = new THREE.BoxGeometry(0.7, 0.4, 0.7);
        const leaf2 = new THREE.Mesh(leaf2Geo, leafMat);
        leaf2.position.y = 1.4;
        leaf2.castShadow = true;
        group.add(leaf2);

        const leaf3Geo = new THREE.BoxGeometry(0.4, 0.3, 0.4);
        const leaf3 = new THREE.Mesh(leaf3Geo, leafMat);
        leaf3.position.y = 1.7;
        leaf3.castShadow = true;
        group.add(leaf3);

        return group;
    }

    createRock() {
        const group = new THREE.Group();

        const rockGeo = new THREE.BoxGeometry(0.4, 0.3, 0.4);
        const rockMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.ROCK });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.y = 0.15;
        rock.rotation.y = Math.random() * Math.PI;
        rock.castShadow = true;
        rock.receiveShadow = true;
        group.add(rock);

        return group;
    }

    createCar() {
        const group = new THREE.Group();
        const color = CONFIG.COLORS.CAR_COLORS[Math.floor(Math.random() * CONFIG.COLORS.CAR_COLORS.length)];

        // Body
        const bodyGeo = new THREE.BoxGeometry(0.6, 0.25, 0.4);
        const bodyMat = new THREE.MeshLambertMaterial({ color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.2;
        body.castShadow = true;
        group.add(body);

        // Top
        const topGeo = new THREE.BoxGeometry(0.35, 0.2, 0.35);
        const topMat = new THREE.MeshLambertMaterial({ color: 0x90CAF9 });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.set(-0.05, 0.42, 0);
        top.castShadow = true;
        group.add(top);

        // Wheels
        const wheelGeo = new THREE.BoxGeometry(0.1, 0.15, 0.45);
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x212121 });

        const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
        frontWheel.position.set(0.2, 0.08, 0);
        group.add(frontWheel);

        const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
        backWheel.position.set(-0.2, 0.08, 0);
        group.add(backWheel);

        // Headlights
        const lightGeo = new THREE.BoxGeometry(0.05, 0.08, 0.1);
        const lightMat = new THREE.MeshLambertMaterial({ color: 0xFFEB3B });

        const light1 = new THREE.Mesh(lightGeo, lightMat);
        light1.position.set(0.32, 0.2, 0.12);
        group.add(light1);

        const light2 = new THREE.Mesh(lightGeo, lightMat);
        light2.position.set(0.32, 0.2, -0.12);
        group.add(light2);

        group.userData.width = 0.8;
        return group;
    }

    createTruck() {
        const group = new THREE.Group();
        const color = CONFIG.COLORS.TRUCK_COLORS[Math.floor(Math.random() * CONFIG.COLORS.TRUCK_COLORS.length)];

        // Cab
        const cabGeo = new THREE.BoxGeometry(0.4, 0.4, 0.45);
        const cabMat = new THREE.MeshLambertMaterial({ color });
        const cab = new THREE.Mesh(cabGeo, cabMat);
        cab.position.set(0.45, 0.3, 0);
        cab.castShadow = true;
        group.add(cab);

        // Cargo
        const cargoGeo = new THREE.BoxGeometry(0.8, 0.5, 0.5);
        const cargoMat = new THREE.MeshLambertMaterial({ color: 0xBDBDBD });
        const cargo = new THREE.Mesh(cargoGeo, cargoMat);
        cargo.position.set(-0.1, 0.35, 0);
        cargo.castShadow = true;
        group.add(cargo);

        // Wheels
        const wheelGeo = new THREE.BoxGeometry(0.12, 0.18, 0.52);
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x212121 });

        for (let x of [0.35, -0.1, -0.4]) {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(x, 0.09, 0);
            group.add(wheel);
        }

        group.userData.width = 1.4;
        return group;
    }

    createLog(length) {
        const group = new THREE.Group();

        const logGeo = new THREE.BoxGeometry(length * 0.5, 0.25, 0.4);
        const logMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.LOG });
        const log = new THREE.Mesh(logGeo, logMat);
        log.position.y = 0.05;
        log.castShadow = true;
        log.receiveShadow = true;
        group.add(log);

        // Log details (rings)
        const ringGeo = new THREE.BoxGeometry(0.02, 0.2, 0.35);
        const ringMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });

        for (let i = 0; i < length; i++) {
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.set(-length * 0.25 + 0.25 + i * 0.5, 0.08, 0);
            group.add(ring);
        }

        group.userData.length = length;
        return group;
    }

    createTrain() {
        const group = new THREE.Group();
        const numCars = Math.floor(Math.random() * 3) + 4;

        // Engine
        const engineGeo = new THREE.BoxGeometry(1.2, 0.6, 0.6);
        const engineMat = new THREE.MeshLambertMaterial({ color: CONFIG.COLORS.TRAIN });
        const engine = new THREE.Mesh(engineGeo, engineMat);
        engine.position.set(0, 0.35, 0);
        engine.castShadow = true;
        group.add(engine);

        // Smokestack
        const stackGeo = new THREE.BoxGeometry(0.2, 0.3, 0.2);
        const stackMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
        const stack = new THREE.Mesh(stackGeo, stackMat);
        stack.position.set(0.35, 0.75, 0);
        group.add(stack);

        // Front light
        const lightGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const lightMat = new THREE.MeshLambertMaterial({ color: 0xFFEB3B, emissive: 0xFFEB3B, emissiveIntensity: 0.5 });
        const light = new THREE.Mesh(lightGeo, lightMat);
        light.position.set(0.65, 0.35, 0);
        group.add(light);

        // Train cars
        for (let i = 1; i <= numCars; i++) {
            const carGeo = new THREE.BoxGeometry(0.9, 0.45, 0.55);
            const carColors = [0xB71C1C, 0x1565C0, 0x2E7D32, 0x6A1B9A, 0xE65100];
            const carMat = new THREE.MeshLambertMaterial({
                color: carColors[i % carColors.length]
            });
            const car = new THREE.Mesh(carGeo, carMat);
            car.position.set(-i * 1.1, 0.3, 0);
            car.castShadow = true;
            group.add(car);
        }

        // Wheels for all cars
        const wheelGeo = new THREE.BoxGeometry(0.15, 0.2, 0.65);
        const wheelMat = new THREE.MeshLambertMaterial({ color: 0x424242 });

        for (let i = 0; i <= numCars; i++) {
            const x = -i * 1.1;
            const wheel1 = new THREE.Mesh(wheelGeo, wheelMat);
            wheel1.position.set(x + 0.3, 0.1, 0);
            group.add(wheel1);

            const wheel2 = new THREE.Mesh(wheelGeo, wheelMat);
            wheel2.position.set(x - 0.3, 0.1, 0);
            group.add(wheel2);
        }

        group.userData.width = numCars * 1.1 + 1.2;
        return group;
    }

    createEagle() {
        const group = new THREE.Group();

        // Body
        const bodyGeo = new THREE.BoxGeometry(0.6, 0.3, 0.8);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeo = new THREE.BoxGeometry(0.3, 0.25, 0.3);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 0.15, 0.4);
        group.add(head);

        // Beak
        const beakGeo = new THREE.BoxGeometry(0.1, 0.1, 0.2);
        const beakMat = new THREE.MeshLambertMaterial({ color: 0xFFC107 });
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.position.set(0, 0.1, 0.6);
        group.add(beak);

        // Wings
        const wingGeo = new THREE.BoxGeometry(0.8, 0.1, 0.5);
        const wingMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });

        const leftWing = new THREE.Mesh(wingGeo, wingMat);
        leftWing.position.set(-0.6, 0.1, 0);
        leftWing.rotation.z = 0.3;
        group.add(leftWing);
        group.userData.leftWing = leftWing;

        const rightWing = new THREE.Mesh(wingGeo, wingMat);
        rightWing.position.set(0.6, 0.1, 0);
        rightWing.rotation.z = -0.3;
        group.add(rightWing);
        group.userData.rightWing = rightWing;

        return group;
    }

    // ============================================
    // COIN SYSTEM
    // ============================================
    addCoin(z, laneType) {
        if (laneType === 'water') return; // No coins on water

        const x = Math.floor(Math.random() * 5 - 2);

        const coinGroup = new THREE.Group();

        // Coin body
        const coinGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
        const coinMat = new THREE.MeshLambertMaterial({
            color: CONFIG.COLORS.COIN,
            emissive: CONFIG.COLORS.COIN,
            emissiveIntensity: 0.3
        });
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.rotation.x = Math.PI / 2;
        coin.castShadow = true;
        coinGroup.add(coin);

        // Coin star detail
        const starGeo = new THREE.BoxGeometry(0.08, 0.02, 0.08);
        const starMat = new THREE.MeshLambertMaterial({ color: 0xFFAB00 });
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.z = 0.03;
        coinGroup.add(star);

        coinGroup.position.set(x, 0.5, z);
        this.scene.add(coinGroup);

        this.coins3D.push({
            mesh: coinGroup,
            x: x,
            z: z,
            collected: false
        });
    }

    collectCoin(coin) {
        if (coin.collected) return;

        coin.collected = true;
        this.coins++;
        this.score += CONFIG.COIN_VALUE * 10;

        // Animate coin collection
        const startY = coin.mesh.position.y;
        const startScale = coin.mesh.scale.x;

        const animate = () => {
            coin.mesh.position.y += 0.1;
            coin.mesh.scale.multiplyScalar(0.9);
            coin.mesh.rotation.y += 0.3;

            if (coin.mesh.scale.x > 0.1) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(coin.mesh);
            }
        };
        animate();

        this.updateHUD();
        this.playSound('coin');

        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(30);
        }
    }

    // ============================================
    // PLAYER MOVEMENT
    // ============================================
    movePlayer(direction) {
        if (this.state !== GameState.PLAYING || this.isMoving) {
            if (direction) {
                this.moveQueue.push(direction);
            }
            return;
        }

        let targetX = this.player.userData.targetX;
        let targetZ = this.player.userData.targetZ;

        switch (direction) {
            case 'up':
                targetZ += CONFIG.LANE_WIDTH;
                break;
            case 'down':
                targetZ -= CONFIG.LANE_WIDTH;
                break;
            case 'left':
                targetX -= CONFIG.LANE_WIDTH;
                break;
            case 'right':
                targetX += CONFIG.LANE_WIDTH;
                break;
        }

        // Check boundaries
        if (Math.abs(targetX) > CONFIG.WORLD_WIDTH / 2 - 1) {
            return;
        }

        // Check for blocking decorations
        const blocked = this.decorations.find(d =>
            d.blocking &&
            Math.abs(d.x - targetX) < 0.5 &&
            Math.abs(d.z - targetZ) < 0.5
        );

        if (blocked) {
            return;
        }

        this.isMoving = true;
        this.player.userData.targetX = targetX;
        this.player.userData.targetZ = targetZ;

        // Rotate player
        const rotations = {
            'up': 0,
            'down': Math.PI,
            'left': Math.PI / 2,
            'right': -Math.PI / 2
        };
        this.player.rotation.y = rotations[direction];

        // Hop animation
        this.animateHop(targetX, targetZ);

        // Update score if moving forward
        if (direction === 'up' && targetZ > this.maxZ) {
            this.maxZ = targetZ;
            this.score = Math.floor(this.maxZ);
            this.updateHUD();
        }

        // Reset idle timer
        this.resetIdleTimer();

        this.playSound('hop');
    }

    animateHop(targetX, targetZ) {
        const startX = this.player.position.x;
        const startZ = this.player.position.z;
        const startY = this.player.position.y;
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / CONFIG.HOP_DURATION, 1);

            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);

            // Position
            this.player.position.x = startX + (targetX - startX) * eased;
            this.player.position.z = startZ + (targetZ - startZ) * eased;

            // Hop height (parabola)
            const hopProgress = Math.sin(progress * Math.PI);
            this.player.position.y = 0.3 + CONFIG.HOP_HEIGHT * hopProgress;

            // Squash and stretch
            const squash = 1 - hopProgress * 0.2;
            const stretch = 1 + hopProgress * 0.3;
            this.player.scale.set(0.8 * squash, 0.8 * stretch, 0.8 * squash);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.player.position.y = 0.3;
                this.player.scale.set(0.8, 0.8, 0.8);
                this.isMoving = false;

                // Check for coin collection
                this.checkCoinCollection();

                // Check lane type for water death
                this.checkLandingPosition();

                // Process queued moves
                if (this.moveQueue.length > 0) {
                    const nextMove = this.moveQueue.shift();
                    this.movePlayer(nextMove);
                }

                // Generate new lanes
                this.updateLanes();
            }
        };

        animate();
    }

    checkCoinCollection() {
        const playerX = this.player.position.x;
        const playerZ = this.player.position.z;

        for (const coin of this.coins3D) {
            if (!coin.collected) {
                const dx = Math.abs(coin.x - playerX);
                const dz = Math.abs(coin.z - playerZ);

                if (dx < 0.5 && dz < 0.5) {
                    this.collectCoin(coin);
                }
            }
        }
    }

    checkLandingPosition() {
        const playerZ = Math.round(this.player.position.z);
        const lane = this.lanes.find(l => l.userData.z === playerZ);

        if (lane && lane.userData.type === 'water') {
            // Check if on a log
            const playerX = this.player.position.x;
            const onLog = this.obstacles.find(o =>
                o.type === 'log' &&
                o.z === playerZ &&
                Math.abs(o.mesh.position.x - playerX) < o.width / 2
            );

            if (!onLog) {
                this.gameOver('water');
            } else {
                this.player.userData.currentLane = onLog;
            }
        } else {
            this.player.userData.currentLane = null;
        }
    }

    // ============================================
    // IDLE TIMER & EAGLE
    // ============================================
    resetIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }

        if (this.eagleWarning) {
            this.hideEagleWarning();
        }

        this.idleTimer = setTimeout(() => {
            this.showEagleWarning();
        }, CONFIG.IDLE_TIMEOUT - 2000);
    }

    showEagleWarning() {
        this.eagleWarning = true;

        // Create warning element
        const warning = document.createElement('div');
        warning.className = 'eagle-warning';
        warning.textContent = '🦅 EAGLE INCOMING!';
        warning.id = 'eagle-warning';
        document.getElementById('game-container').appendChild(warning);

        this.playSound('eagle');

        // Spawn eagle after warning
        setTimeout(() => {
            if (this.state === GameState.PLAYING && this.eagleWarning) {
                this.spawnEagle();
            }
        }, 2000);
    }

    hideEagleWarning() {
        this.eagleWarning = false;
        const warning = document.getElementById('eagle-warning');
        if (warning) {
            warning.remove();
        }

        if (this.eagle) {
            this.scene.remove(this.eagle);
            this.eagle = null;
        }
    }

    spawnEagle() {
        this.eagle = this.createEagle();
        this.eagle.position.set(
            this.player.position.x,
            10,
            this.player.position.z - 5
        );
        this.scene.add(this.eagle);

        // Animate eagle diving
        const startY = this.eagle.position.y;
        const startZ = this.eagle.position.z;
        const targetY = this.player.position.y + 0.5;
        const targetZ = this.player.position.z;
        const startTime = performance.now();
        const duration = 1500;

        const animate = () => {
            if (!this.eagle || this.state !== GameState.PLAYING) return;

            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.eagle.position.y = startY + (targetY - startY) * progress;
            this.eagle.position.z = startZ + (targetZ - startZ) * progress;

            // Wing flapping
            const wingAngle = Math.sin(elapsed * 0.02) * 0.5;
            this.eagle.userData.leftWing.rotation.z = 0.3 + wingAngle;
            this.eagle.userData.rightWing.rotation.z = -0.3 - wingAngle;

            if (progress >= 1) {
                // Check if player is still in same position
                const dx = Math.abs(this.eagle.position.x - this.player.position.x);
                const dz = Math.abs(this.eagle.position.z - this.player.position.z);

                if (dx < 0.5 && dz < 0.5) {
                    this.gameOver('eagle');
                } else {
                    // Eagle missed, fly away
                    this.eagleFlyAway();
                }
            } else {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    eagleFlyAway() {
        if (!this.eagle) return;

        const startY = this.eagle.position.y;
        const startTime = performance.now();

        const animate = () => {
            if (!this.eagle) return;

            const elapsed = performance.now() - startTime;
            this.eagle.position.y = startY + elapsed * 0.01;
            this.eagle.position.z += 0.1;

            if (this.eagle.position.y < 15) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(this.eagle);
                this.eagle = null;
                this.hideEagleWarning();
            }
        };

        animate();
    }

    // ============================================
    // LANE MANAGEMENT
    // ============================================
    updateLanes() {
        const playerZ = Math.floor(this.player.position.z);

        // Generate new lanes ahead
        const furthestZ = Math.max(...this.lanes.map(l => l.userData.z));
        const neededZ = playerZ + CONFIG.VISIBLE_LANES;

        for (let z = furthestZ + 1; z <= neededZ; z++) {
            this.generateLane(z);
        }

        // Remove old lanes behind
        const removeZ = playerZ - CONFIG.LANES_BEHIND;
        this.lanes = this.lanes.filter(lane => {
            if (lane.userData.z < removeZ) {
                this.scene.remove(lane);
                return false;
            }
            return true;
        });

        // Clean up obstacles
        this.obstacles = this.obstacles.filter(o => {
            if (o.z < removeZ) {
                return false;
            }
            return true;
        });

        // Clean up coins
        this.coins3D = this.coins3D.filter(c => {
            if (c.z < removeZ) {
                if (!c.collected) {
                    this.scene.remove(c.mesh);
                }
                return false;
            }
            return true;
        });

        // Clean up decorations
        this.decorations = this.decorations.filter(d => d.z >= removeZ);
    }

    // ============================================
    // GAME LOOP
    // ============================================
    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();

        if (this.state === GameState.PLAYING) {
            this.updateObstacles(delta);
            this.updateTrains(delta);
            this.checkCollisions();
            this.updateCamera();
            this.updatePlayerOnLog();
        } else if (this.state === GameState.MENU && this.menuChicken) {
            // Idle animation for menu chicken
            this.menuChicken.position.y = 0.3 + Math.sin(Date.now() * 0.003) * 0.05;
            this.menuChicken.rotation.y = Math.sin(Date.now() * 0.001) * 0.3;
        }

        // Rotate coins
        for (const coin of this.coins3D) {
            if (!coin.collected) {
                coin.mesh.rotation.y += 0.05;
                coin.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.005 + coin.z) * 0.1;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateObstacles(delta) {
        for (const obstacle of this.obstacles) {
            obstacle.mesh.position.x += obstacle.speed;

            // Wrap around
            const halfWorld = CONFIG.WORLD_WIDTH / 2 + obstacle.width;
            if (obstacle.mesh.position.x > halfWorld) {
                obstacle.mesh.position.x = -halfWorld;
            } else if (obstacle.mesh.position.x < -halfWorld) {
                obstacle.mesh.position.x = halfWorld;
            }
        }
    }

    updateTrains(delta) {
        for (const lane of this.lanes) {
            if (lane.userData.type !== 'rail') continue;

            if (lane.userData.hasActiveTrain) continue;

            lane.userData.trainTimer -= delta * 1000;

            if (lane.userData.trainTimer <= 0) {
                this.spawnTrain(lane);
                lane.userData.trainTimer = Math.random() * 5000 + 4000;
            }
        }
    }

    spawnTrain(lane) {
        const train = this.createTrain();
        const direction = lane.userData.trainDirection;
        const startX = direction > 0 ? -CONFIG.WORLD_WIDTH - 5 : CONFIG.WORLD_WIDTH + 5;

        train.position.set(startX, 0.15, lane.userData.z);
        train.rotation.y = direction > 0 ? 0 : Math.PI;
        lane.add(train);

        lane.userData.hasActiveTrain = true;

        // Warning sound
        this.playSound('train');

        // Animate train
        const speed = 0.25 * direction;
        const endX = direction > 0 ? CONFIG.WORLD_WIDTH + 10 : -CONFIG.WORLD_WIDTH - 10;

        const animateTrain = () => {
            if (this.state !== GameState.PLAYING && this.state !== GameState.PAUSED) {
                lane.remove(train);
                lane.userData.hasActiveTrain = false;
                return;
            }

            if (this.state === GameState.PAUSED) {
                requestAnimationFrame(animateTrain);
                return;
            }

            train.position.x += speed;

            // Check collision with player
            const playerZ = Math.round(this.player.position.z);
            if (playerZ === lane.userData.z) {
                const playerX = this.player.position.x;
                const trainWidth = train.userData.width;

                if (Math.abs(train.position.x - playerX) < trainWidth / 2) {
                    this.gameOver('train');
                }
            }

            if ((direction > 0 && train.position.x < endX) ||
                (direction < 0 && train.position.x > endX)) {
                requestAnimationFrame(animateTrain);
            } else {
                lane.remove(train);
                lane.userData.hasActiveTrain = false;
            }
        };

        animateTrain();
    }

    updatePlayerOnLog() {
        if (this.player.userData.currentLane && this.player.userData.currentLane.type === 'log') {
            const log = this.player.userData.currentLane;
            this.player.position.x += log.speed;
            this.player.userData.targetX = this.player.position.x;

            // Check if player fell off log
            if (Math.abs(this.player.position.x - log.mesh.position.x) > log.width / 2) {
                this.gameOver('water');
            }

            // Check if player went out of bounds
            if (Math.abs(this.player.position.x) > CONFIG.WORLD_WIDTH / 2) {
                this.gameOver('water');
            }
        }
    }

    checkCollisions() {
        if (this.isMoving) return;

        const playerX = this.player.position.x;
        const playerZ = Math.round(this.player.position.z);

        for (const obstacle of this.obstacles) {
            if (obstacle.type === 'vehicle' && obstacle.z === playerZ) {
                const distance = Math.abs(obstacle.mesh.position.x - playerX);
                const hitDistance = (obstacle.width / 2) + 0.2;

                if (distance < hitDistance) {
                    this.gameOver('hit');
                    return;
                }
            }
        }
    }

    updateCamera(instant = false) {
        const targetX = this.player.position.x * 0.3;
        const targetZ = this.player.position.z - 8;

        if (instant) {
            this.camera.position.x = targetX;
            this.camera.position.z = targetZ;
        } else {
            this.camera.position.x += (targetX - this.camera.position.x) * 0.1;
            this.camera.position.z += (targetZ - this.camera.position.z) * 0.1;
        }

        this.camera.lookAt(
            this.player.position.x,
            0,
            this.player.position.z + 5
        );

        // Update sun position
        if (this.sun) {
            this.sun.position.x = this.player.position.x + 10;
            this.sun.position.z = this.player.position.z + 10;
            this.sun.target.position.copy(this.player.position);
            this.sun.target.updateMatrixWorld();
        }
    }

    updateHUD() {
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('coin-count').textContent = this.coins;

        // Animate score change
        const scoreEl = document.getElementById('current-score');
        scoreEl.classList.remove('score-pop');
        void scoreEl.offsetWidth; // Trigger reflow
        scoreEl.classList.add('score-pop');
    }

    // ============================================
    // INPUT HANDLING
    // ============================================
    onTouchStart(e) {
        if (this.state !== GameState.PLAYING) return;
        e.preventDefault();

        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStartTime = Date.now();
    }

    onTouchMove(e) {
        e.preventDefault();
    }

    onTouchEnd(e) {
        if (this.state !== GameState.PLAYING) return;
        e.preventDefault();

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const deltaTime = Date.now() - this.touchStartTime;

        // Tap detection
        if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20 && deltaTime < 200) {
            this.movePlayer('up');
            return;
        }

        // Swipe detection
        const minSwipe = 30;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > minSwipe) {
                this.movePlayer('right');
            } else if (deltaX < -minSwipe) {
                this.movePlayer('left');
            }
        } else {
            if (deltaY < -minSwipe) {
                this.movePlayer('up');
            } else if (deltaY > minSwipe) {
                this.movePlayer('down');
            }
        }
    }

    onMouseDown(e) {
        this.touchStartX = e.clientX;
        this.touchStartY = e.clientY;
        this.touchStartTime = Date.now();
    }

    onMouseUp(e) {
        if (this.state !== GameState.PLAYING) return;

        const deltaX = e.clientX - this.touchStartX;
        const deltaY = e.clientY - this.touchStartY;
        const deltaTime = Date.now() - this.touchStartTime;

        // Click detection
        if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20 && deltaTime < 200) {
            this.movePlayer('up');
            return;
        }

        // Drag detection
        const minSwipe = 30;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > minSwipe) {
                this.movePlayer('right');
            } else if (deltaX < -minSwipe) {
                this.movePlayer('left');
            }
        } else {
            if (deltaY < -minSwipe) {
                this.movePlayer('up');
            } else if (deltaY > minSwipe) {
                this.movePlayer('down');
            }
        }
    }

    onKeyDown(e) {
        if (this.state === GameState.PLAYING) {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.movePlayer('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    this.movePlayer('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer('right');
                    break;
                case 'Escape':
                case 'p':
                case 'P':
                    this.pauseGame();
                    break;
            }
        } else if (this.state === GameState.PAUSED) {
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                this.resumeGame();
            }
        } else if (this.state === GameState.MENU) {
            if (e.key === 'Enter' || e.key === ' ') {
                this.startGame();
            }
        }
    }

    // ============================================
    // SETTINGS
    // ============================================
    toggleSetting(e, setting) {
        const btn = e.target;
        const isOn = btn.classList.contains('on');

        if (isOn) {
            btn.classList.remove('on');
            btn.classList.add('off');
            btn.textContent = 'OFF';
        } else {
            btn.classList.remove('off');
            btn.classList.add('on');
            btn.textContent = 'ON';
        }

        switch (setting) {
            case 'sound':
                this.soundEnabled = !isOn;
                localStorage.setItem('crossySound', this.soundEnabled);
                break;
            case 'music':
                this.musicEnabled = !isOn;
                localStorage.setItem('crossyMusic', this.musicEnabled);
                break;
            case 'vibration':
                this.vibrationEnabled = !isOn;
                localStorage.setItem('crossyVibration', this.vibrationEnabled);
                break;
        }
    }

    // ============================================
    // AUDIO
    // ============================================
    playSound(name) {
        if (!this.soundEnabled) return;

        // Create audio context for sound synthesis
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            switch (name) {
                case 'hop':
                    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.1);
                    break;
                case 'coin':
                    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
                    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.05);
                    oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.15);
                    break;
                case 'hit':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.3);
                    break;
                case 'train':
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
                    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
                    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.15);
                    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.2);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.4);
                    break;
                case 'eagle':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.5);
                    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                    oscillator.start(audioCtx.currentTime);
                    oscillator.stop(audioCtx.currentTime + 0.5);
                    break;
            }
        } catch (e) {
            // Audio not supported
        }
    }

    // ============================================
    // SHARE
    // ============================================
    shareScore() {
        const text = `I scored ${this.score} points in Crossy Roads! Can you beat my score?`;

        if (navigator.share) {
            navigator.share({
                title: 'Crossy Roads Score',
                text: text,
                url: window.location.href
            }).catch(() => {});
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                alert('Score copied to clipboard!');
            }).catch(() => {
                alert(text);
            });
        }
    }
}

// ============================================
// INITIALIZE GAME
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    window.game = new CrossyRoadsGame();
});

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('#game-container')) {
        e.preventDefault();
    }
}, { passive: false });

// Handle orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (window.game) {
            window.game.onResize();
        }
    }, 100);
});
