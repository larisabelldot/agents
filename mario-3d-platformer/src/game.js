// Main game controller

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.running = false;
        this.paused = false;
        this.lastTime = 0;

        // Game state
        this.state = 'menu'; // menu, playing, paused, gameover, victory

        // Initialize systems
        this.initializeRenderer();
        this.initializeScene();
        this.initializeSystems();
        this.initializeGameObjects();

        // Resize handler
        window.addEventListener('resize', () => this.onResize());
        this.onResize();
    }

    initializeRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    initializeScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 100);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        directionalLight.shadow.camera.far = 150;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Add sun visual
        const sunGeometry = new THREE.SphereGeometry(5, 16, 16);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.copy(directionalLight.position);
        this.scene.add(sun);
    }

    initializeSystems() {
        // Core systems
        this.physics = new PhysicsWorld();
        this.input = new InputManager();
        this.input.setCanvas(this.canvas);

        // Managers
        this.enemyManager = new EnemyManager(this.scene, this.physics);
        this.collectibleManager = new CollectibleManager(this.scene);
        this.powerUpManager = new PowerUpManager(this.scene, this.physics);
        this.particleSystem = new ParticleSystem(this.scene);
        this.hud = new HUDManager();

        // Level
        this.level = new Level(this.scene, this.physics);

        // Menu (note: audioManager will be set in main.js)
        this.menuManager = new MenuManager(window.audioManager);

        // Setup menu callbacks
        this.menuManager.onStartGame = () => this.startGame();
        this.menuManager.onResumeGame = () => this.resumeGame();
        this.menuManager.onQuitToMenu = () => this.quitToMenu();
        this.menuManager.onRetry = () => this.retryGame();
    }

    initializeGameObjects() {
        // Player will be created when game starts
        this.player = null;
        this.cameraController = null;
    }

    startGame() {
        // Show loading
        this.menuManager.showLoading(true);
        this.menuManager.updateLoadingProgress(0, 'Building level...');

        // Simulate loading with progress
        setTimeout(() => {
            this.menuManager.updateLoadingProgress(30, 'Spawning enemies...');

            // Build level
            this.level.buildLevel1();

            setTimeout(() => {
                this.menuManager.updateLoadingProgress(60, 'Placing collectibles...');

                // Create player
                this.player = new Player(this.scene, this.physics);
                this.cameraController = new CameraController(this.camera, this.player);

                // Spawn enemies
                this.spawnEnemies();

                setTimeout(() => {
                    this.menuManager.updateLoadingProgress(80, 'Adding power-ups...');

                    // Spawn collectibles
                    this.spawnCollectibles();

                    setTimeout(() => {
                        this.menuManager.updateLoadingProgress(100, 'Ready!');

                        // Spawn power-ups
                        this.spawnPowerUps();

                        setTimeout(() => {
                            // Start game
                            this.menuManager.showLoading(false);
                            this.menuManager.showScreen('gameContainer');
                            this.hud.show();
                            this.hud.reset();
                            this.hud.startTimer();

                            this.state = 'playing';
                            this.paused = false;
                            this.running = true;

                            // Start game loop if not already running
                            if (!this.animationFrameId) {
                                this.gameLoop(0);
                            }
                        }, 500);
                    }, 300);
                }, 300);
            }, 300);
        }, 300);
    }

    spawnEnemies() {
        // Spawn Goombas
        this.enemyManager.spawnEnemy(new THREE.Vector3(12, 1, 5), 'goomba');
        this.enemyManager.spawnEnemy(new THREE.Vector3(25, 1, 5), 'goomba');
        this.enemyManager.spawnEnemy(new THREE.Vector3(32, 1, 5), 'goomba');
        this.enemyManager.spawnEnemy(new THREE.Vector3(42, 1, 3), 'goomba');
        this.enemyManager.spawnEnemy(new THREE.Vector3(42, 1, 7), 'goomba');

        // Spawn Koopas
        this.enemyManager.spawnEnemy(new THREE.Vector3(55, 1, 5), 'koopa');
        this.enemyManager.spawnEnemy(new THREE.Vector3(65, 1, 5), 'koopa');
    }

    spawnCollectibles() {
        // Spawn coins
        for (let i = 0; i < 20; i++) {
            const x = 5 + i * 4;
            const y = 3;
            const z = Math.sin(i) * 3;
            this.collectibleManager.spawnCoin(new THREE.Vector3(x, y, z));
        }

        // Additional coin clusters
        for (let i = 0; i < 5; i++) {
            this.collectibleManager.spawnCoin(new THREE.Vector3(35, 10 + i, 0));
            this.collectibleManager.spawnCoin(new THREE.Vector3(35, 10 + i, 10));
        }

        // Spawn stars
        this.collectibleManager.spawnStar(new THREE.Vector3(22, 8, 5));
        this.collectibleManager.spawnStar(new THREE.Vector3(45, 14, 5));
        this.collectibleManager.spawnStar(new THREE.Vector3(60, 17, 5));
    }

    spawnPowerUps() {
        // Spawn mushrooms
        this.powerUpManager.spawnPowerUp(new THREE.Vector3(15, 1, 5), 'mushroom');
        this.powerUpManager.spawnPowerUp(new THREE.Vector3(35, 9, 5), 'mushroom');

        // Spawn fire flowers
        this.powerUpManager.spawnPowerUp(new THREE.Vector3(45, 13, 5), 'fireflower');

        // Spawn star
        this.powerUpManager.spawnPowerUp(new THREE.Vector3(70, 1, 5), 'starman');
    }

    update(deltaTime) {
        if (this.state !== 'playing' || this.paused) return;

        // Update input
        const mouseDelta = this.input.getMouseDelta();

        // Check for pause
        if (this.input.isPausePressed() && !this.lastPauseState) {
            this.pauseGame();
        }
        this.lastPauseState = this.input.isPausePressed();

        // Update player
        if (this.player) {
            this.player.update(deltaTime, this.input);
        }

        // Update camera
        if (this.cameraController) {
            this.cameraController.update(deltaTime, mouseDelta);
        }

        // Update physics
        this.physics.update(deltaTime);

        // Update enemies
        this.enemyManager.update(deltaTime, this.player);

        // Update collectibles
        this.collectibleManager.update(deltaTime, this.player);

        // Update power-ups
        this.powerUpManager.update(deltaTime, this.player);

        // Update particles
        this.particleSystem.update(deltaTime);

        // Update HUD
        this.hud.update(this.player, this.collectibleManager);

        // Update timer
        const timeUp = this.hud.updateTimer(deltaTime);
        if (timeUp) {
            this.gameOver();
        }

        // Check game over condition
        if (this.player.lives <= 0) {
            this.gameOver();
        }

        // Check victory condition (collect all stars)
        if (this.collectibleManager.getActiveStars() === 0 &&
            this.collectibleManager.getTotalStars() > 0) {
            this.victory();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    gameLoop(timestamp) {
        if (!this.running && this.state === 'menu') {
            // Keep rendering menu
            this.render();
            this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
            return;
        }

        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1); // Cap at 100ms
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    pauseGame() {
        this.paused = true;
        this.state = 'paused';
        this.hud.stopTimer();
        this.menuManager.showScreen('pauseScreen');
    }

    resumeGame() {
        this.paused = false;
        this.state = 'playing';
        this.hud.startTimer();
        this.menuManager.showScreen('gameContainer');

        // Request pointer lock again
        this.canvas.requestPointerLock();
    }

    gameOver() {
        this.state = 'gameover';
        this.running = false;
        this.hud.stopTimer();
        this.menuManager.showGameOver(this.player.score);
    }

    victory() {
        this.state = 'victory';
        this.running = false;
        this.hud.stopTimer();
        const completionTime = 400 - this.hud.gameTime;
        this.menuManager.showVictory(this.player.score, completionTime);
    }

    retryGame() {
        this.cleanupGame();
        this.startGame();
    }

    quitToMenu() {
        this.cleanupGame();
        this.menuManager.showScreen('titleScreen');
        this.state = 'menu';
        this.hud.hide();
    }

    cleanupGame() {
        // Clean up all game objects
        if (this.player) {
            this.scene.remove(this.player.model);
            this.physics.removeObject(this.player);
            this.player = null;
        }

        this.level.clear();
        this.enemyManager.clear();
        this.collectibleManager.clear();
        this.powerUpManager.clear();
        this.particleSystem.clear();

        this.running = false;
        this.paused = false;
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    start() {
        this.gameLoop(0);
    }
}
