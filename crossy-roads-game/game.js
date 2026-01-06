// ========================================
// EPIC CROSSY ROADS 3D - Main Game Engine
// ========================================

class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.score = 0;
        this.coins = 0;
        this.combo = 0;
        this.lastMoveTime = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.totalCoins = parseInt(localStorage.getItem('totalCoins')) || 0;

        // Terrain
        this.lanes = [];
        this.laneTypes = ['grass', 'road', 'rail', 'river'];
        this.maxLanes = 50;
        this.laneDistance = 2;
        this.furthestLane = 0;

        // Obstacles
        this.obstacles = [];
        this.vehicles = [];
        this.collectibles = [];
        this.powerups = [];

        // Biomes
        this.currentBiome = 'grass';
        this.biomes = {
            grass: { color: 0x4a9d4a, name: 'Grasslands' },
            desert: { color: 0xd4a76a, name: 'Desert' },
            snow: { color: 0xe8f4f8, name: 'Snowy Peaks' },
            city: { color: 0x606060, name: 'Cyber City' },
            forest: { color: 0x2d5016, name: 'Dark Forest' }
        };

        // Characters
        this.selectedCharacter = 'chicken';
        this.unlockedCharacters = JSON.parse(localStorage.getItem('unlockedCharacters')) || ['chicken'];
        this.characters = {
            chicken: { icon: '🐔', name: 'Chicken', cost: 0, ability: 'none' },
            rabbit: { icon: '🐰', name: 'Speedster Rabbit', cost: 500, ability: 'speed' },
            frog: { icon: '🐸', name: 'River Jumper', cost: 750, ability: 'water' },
            unicorn: { icon: '🦄', name: 'Rainbow Unicorn', cost: 1000, ability: 'double_coins' },
            robot: { icon: '🤖', name: 'Robot X', cost: 1500, ability: 'shield' },
            dragon: { icon: '🐉', name: 'Fire Dragon', cost: 2000, ability: 'destroy' },
            ninja: { icon: '🥷', name: 'Shadow Ninja', cost: 2500, ability: 'teleport' },
            alien: { icon: '👽', name: 'Space Alien', cost: 3000, ability: 'float' }
        };

        // Powerups
        this.activePowerup = null;
        this.powerupEndTime = 0;

        // Effects
        this.particles = [];
        this.weatherParticles = [];

        // Environment
        this.timeOfDay = 0; // 0-24 hours
        this.weatherType = 'clear'; // clear, rain, snow, fog
        this.weatherEnabled = true;

        // Achievements
        this.achievements = JSON.parse(localStorage.getItem('achievements')) || {};
        this.achievementList = [
            { id: 'first_steps', name: 'First Steps', description: 'Reach score 10', condition: () => this.score >= 10 },
            { id: 'coin_collector', name: 'Coin Collector', description: 'Collect 50 coins in one game', condition: () => this.coins >= 50 },
            { id: 'century', name: 'Century', description: 'Reach score 100', condition: () => this.score >= 100 },
            { id: 'survivor', name: 'Survivor', description: 'Reach score 250', condition: () => this.score >= 250 },
            { id: 'legend', name: 'Legend', description: 'Reach score 500', condition: () => this.score >= 500 },
            { id: 'powerup_master', name: 'Powerup Master', description: 'Use 10 powerups', count: true },
            { id: 'rich', name: 'Rich Player', description: 'Collect 1000 total coins', condition: () => this.totalCoins >= 1000 },
            { id: 'collector', name: 'Character Collector', description: 'Unlock 5 characters', condition: () => this.unlockedCharacters.length >= 5 }
        ];

        // Settings
        this.settings = {
            musicVolume: 50,
            sfxVolume: 50,
            quality: 'medium',
            particles: true,
            weather: true
        };

        // Input
        this.keys = {};
        this.touchStartX = 0;
        this.touchStartY = 0;

        this.init();
    }

    init() {
        this.setupUI();
        this.setupScene();
        this.setupLights();
        this.setupPlayer();
        this.generateInitialTerrain();
        this.setupControls();
        this.setupWeather();
        this.animate();
        this.hideLoading();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87ceeb, 10, 100);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupLights() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        // Directional light (sun)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.sunLight.position.set(10, 20, 10);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.camera.left = -50;
        this.sunLight.shadow.camera.right = 50;
        this.sunLight.shadow.camera.top = 50;
        this.sunLight.shadow.camera.bottom = -50;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);
    }

    setupPlayer() {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshPhongMaterial({ color: 0xffcc00 });
        this.player = new THREE.Mesh(geometry, material);
        this.player.position.set(0, 0.4, 0);
        this.player.castShadow = true;
        this.scene.add(this.player);

        // Add character emoji as sprite
        this.updatePlayerAppearance();
    }

    updatePlayerAppearance() {
        // Remove old sprite if exists
        if (this.playerSprite) {
            this.player.remove(this.playerSprite);
        }

        // Create canvas for emoji
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.font = '100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.characters[this.selectedCharacter].icon, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        this.playerSprite = new THREE.Sprite(spriteMaterial);
        this.playerSprite.position.y = 1;
        this.playerSprite.scale.set(1.5, 1.5, 1);
        this.player.add(this.playerSprite);
    }

    generateInitialTerrain() {
        for (let i = -5; i < 20; i++) {
            this.generateLane(i);
        }
    }

    generateLane(laneIndex) {
        const z = laneIndex * this.laneDistance;

        // First lane is always safe
        let laneType = laneIndex === 0 ? 'grass' : this.getRandomLaneType(laneIndex);

        const lane = {
            index: laneIndex,
            type: laneType,
            z: z,
            meshes: [],
            obstacles: []
        };

        // Create lane mesh
        const laneWidth = 20;
        const geometry = new THREE.BoxGeometry(laneWidth, 0.2, this.laneDistance);

        let color;
        switch (laneType) {
            case 'road':
                color = 0x333333;
                break;
            case 'rail':
                color = 0x4a4a4a;
                break;
            case 'river':
                color = 0x4a90e2;
                break;
            default:
                color = this.getBiomeColor();
        }

        const material = new THREE.MeshPhongMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, z);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        lane.meshes.push(mesh);

        // Add lane details
        this.addLaneDetails(lane);

        // Add obstacles
        if (laneType === 'road') {
            this.addVehicles(lane);
        } else if (laneType === 'rail') {
            this.addTrain(lane);
        } else if (laneType === 'river') {
            this.addRiverObjects(lane);
        } else if (Math.random() < 0.3) {
            this.addCollectibles(lane);
        }

        this.lanes.push(lane);

        // Remove old lanes
        if (this.lanes.length > this.maxLanes) {
            this.removeLane(this.lanes[0]);
        }
    }

    getRandomLaneType(laneIndex) {
        // Change biome every 20 lanes
        if (laneIndex % 20 === 0 && laneIndex > 0) {
            this.changeBiome();
        }

        const rand = Math.random();
        if (rand < 0.3) return 'road';
        if (rand < 0.5) return 'rail';
        if (rand < 0.7) return 'river';
        return 'grass';
    }

    getBiomeColor() {
        return this.biomes[this.currentBiome].color;
    }

    changeBiome() {
        const biomeKeys = Object.keys(this.biomes);
        this.currentBiome = biomeKeys[Math.floor(Math.random() * biomeKeys.length)];

        // Change weather based on biome
        if (this.currentBiome === 'snow') {
            this.setWeather('snow');
        } else if (this.currentBiome === 'desert') {
            this.setWeather('clear');
        } else {
            const weathers = ['clear', 'rain', 'fog'];
            this.setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
        }
    }

    addLaneDetails(lane) {
        // Add grass/trees for grass lanes
        if (lane.type === 'grass') {
            for (let i = 0; i < 5; i++) {
                if (Math.random() < 0.3) {
                    const tree = this.createTree();
                    tree.position.set(
                        (Math.random() - 0.5) * 15,
                        0.5,
                        lane.z + (Math.random() - 0.5) * this.laneDistance
                    );
                    this.scene.add(tree);
                    lane.meshes.push(tree);
                }
            }
        }

        // Add road markings
        if (lane.type === 'road') {
            const lineGeometry = new THREE.BoxGeometry(0.2, 0.05, this.laneDistance);
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(0, 0.11, lane.z);
            this.scene.add(line);
            lane.meshes.push(line);
        }

        // Add rails
        if (lane.type === 'rail') {
            for (let side of [-1, 1]) {
                const railGeometry = new THREE.BoxGeometry(0.1, 0.1, this.laneDistance);
                const railMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
                const rail = new THREE.Mesh(railGeometry, railMaterial);
                rail.position.set(side * 0.5, 0.15, lane.z);
                this.scene.add(rail);
                lane.meshes.push(rail);
            }
        }
    }

    createTree() {
        const group = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.5;
        trunk.castShadow = true;
        group.add(trunk);

        // Leaves
        const leavesGeometry = new THREE.ConeGeometry(0.5, 1, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 1.3;
        leaves.castShadow = true;
        group.add(leaves);

        return group;
    }

    addVehicles(lane) {
        const numVehicles = Math.floor(Math.random() * 3) + 1;
        const direction = Math.random() < 0.5 ? 1 : -1;
        const speed = (Math.random() * 0.02 + 0.03) * direction;

        for (let i = 0; i < numVehicles; i++) {
            const vehicle = this.createVehicle();
            vehicle.position.set(
                (Math.random() - 0.5) * 30,
                0.5,
                lane.z
            );
            vehicle.userData = {
                speed: speed,
                lane: lane.index,
                type: 'car'
            };
            this.scene.add(vehicle);
            this.vehicles.push(vehicle);
            lane.obstacles.push(vehicle);
        }
    }

    createVehicle() {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const group = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.5, 1.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.25;
        body.castShadow = true;
        group.add(body);

        // Roof
        const roofGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.8);
        const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
        roof.position.y = 0.65;
        roof.castShadow = true;
        group.add(roof);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

        const wheelPositions = [
            [-0.4, 0.2, -0.5],
            [0.4, 0.2, -0.5],
            [-0.4, 0.2, 0.5],
            [0.4, 0.2, 0.5]
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            group.add(wheel);
        });

        return group;
    }

    addTrain(lane) {
        if (Math.random() < 0.3) {
            const train = this.createTrain();
            train.position.set(-20, 0.5, lane.z);
            train.userData = {
                speed: 0.15,
                lane: lane.index,
                type: 'train'
            };
            this.scene.add(train);
            this.vehicles.push(train);
            lane.obstacles.push(train);
        }
    }

    createTrain() {
        const group = new THREE.Group();

        // Create multiple cars
        for (let i = 0; i < 5; i++) {
            const carGeometry = new THREE.BoxGeometry(1, 1.5, 3);
            const carMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
            const car = new THREE.Mesh(carGeometry, carMaterial);
            car.position.set(i * 3.5, 0.75, 0);
            car.castShadow = true;
            group.add(car);
        }

        return group;
    }

    addRiverObjects(lane) {
        const numObjects = Math.floor(Math.random() * 4) + 2;
        const direction = Math.random() < 0.5 ? 1 : -1;
        const speed = (Math.random() * 0.01 + 0.02) * direction;

        for (let i = 0; i < numObjects; i++) {
            const log = this.createLog();
            log.position.set(
                (Math.random() - 0.5) * 20,
                0.3,
                lane.z
            );
            log.userData = {
                speed: speed,
                lane: lane.index,
                type: 'log',
                safe: true
            };
            this.scene.add(log);
            this.vehicles.push(log);
            lane.obstacles.push(log);
        }
    }

    createLog() {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
        const material = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const log = new THREE.Mesh(geometry, material);
        log.rotation.z = Math.PI / 2;
        log.castShadow = true;
        return log;
    }

    addCollectibles(lane) {
        if (Math.random() < 0.5) {
            const coin = this.createCoin();
            coin.position.set(
                (Math.random() - 0.5) * 8,
                0.5,
                lane.z
            );
            this.scene.add(coin);
            this.collectibles.push(coin);
        }

        // Add powerups less frequently
        if (Math.random() < 0.1) {
            const powerup = this.createPowerup();
            powerup.position.set(
                (Math.random() - 0.5) * 8,
                0.5,
                lane.z
            );
            this.scene.add(powerup);
            this.powerups.push(powerup);
        }
    }

    createCoin() {
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            emissive: 0xffd700,
            emissiveIntensity: 0.3
        });
        const coin = new THREE.Mesh(geometry, material);
        coin.rotation.x = Math.PI / 2;
        coin.userData = { type: 'coin' };
        return coin;
    }

    createPowerup() {
        const geometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const powerupTypes = ['speed', 'invincibility', 'magnet', 'multiplier'];
        const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];

        let color;
        switch (type) {
            case 'speed': color = 0x00ff00; break;
            case 'invincibility': color = 0xff00ff; break;
            case 'magnet': color = 0x0000ff; break;
            case 'multiplier': color = 0xffa500; break;
        }

        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5
        });
        const powerup = new THREE.Mesh(geometry, material);
        powerup.userData = { type: 'powerup', powerupType: type };
        return powerup;
    }

    removeLane(lane) {
        lane.meshes.forEach(mesh => this.scene.remove(mesh));
        lane.obstacles.forEach(obstacle => {
            this.scene.remove(obstacle);
            this.vehicles = this.vehicles.filter(v => v !== obstacle);
        });
        this.lanes = this.lanes.filter(l => l !== lane);
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            if (this.gameState === 'playing') {
                this.handleMove(e.key);
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Touch controls
        document.addEventListener('touchstart', (e) => {
            if (this.gameState !== 'playing') return;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (this.gameState !== 'playing') return;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const dx = touchEndX - this.touchStartX;
            const dy = touchEndY - this.touchStartY;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 30) this.handleMove('ArrowRight');
                else if (dx < -30) this.handleMove('ArrowLeft');
            } else {
                if (dy > 30) this.handleMove('ArrowDown');
                else if (dy < -30) this.handleMove('ArrowUp');
            }
        });
    }

    handleMove(key) {
        const moveDistance = this.laneDistance;
        const moveSpeed = this.characters[this.selectedCharacter].ability === 'speed' ? 1.5 : 1;
        let moved = false;

        switch (key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.player.position.z -= moveDistance * moveSpeed;
                moved = true;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.player.position.z += moveDistance * moveSpeed;
                moved = true;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.player.position.x -= moveDistance * moveSpeed;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.player.position.x += moveDistance * moveSpeed;
                break;
        }

        // Boundary limits
        this.player.position.x = Math.max(-8, Math.min(8, this.player.position.x));

        if (moved) {
            this.createParticles(this.player.position, 'dust');
            this.playSound('move');

            // Update score
            if (this.player.position.z < -this.furthestLane * this.laneDistance) {
                const progress = Math.abs(this.player.position.z / this.laneDistance);
                this.score = Math.floor(progress);
                this.updateScore();
                this.furthestLane = Math.floor(Math.abs(this.player.position.z / this.laneDistance));

                // Update combo
                const currentTime = Date.now();
                if (currentTime - this.lastMoveTime < 1000) {
                    this.combo++;
                } else {
                    this.combo = 1;
                }
                this.lastMoveTime = currentTime;
                this.updateCombo();

                // Generate new lanes
                if (this.furthestLane > this.lanes[this.lanes.length - 1].index - 10) {
                    for (let i = 0; i < 5; i++) {
                        this.generateLane(this.lanes[this.lanes.length - 1].index + 1);
                    }
                }
            }

            this.checkAchievements();
        }
    }

    setupWeather() {
        this.setWeather('clear');
    }

    setWeather(type) {
        if (!this.settings.weather) return;

        this.weatherType = type;

        // Clear existing weather particles
        this.weatherParticles.forEach(p => this.scene.remove(p));
        this.weatherParticles = [];

        if (type === 'rain') {
            this.createRain();
        } else if (type === 'snow') {
            this.createSnow();
        } else if (type === 'fog') {
            this.scene.fog.far = 50;
        } else {
            this.scene.fog.far = 100;
        }
    }

    createRain() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 100,
                Math.random() * 50,
                (Math.random() - 0.5) * 100
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        const rain = new THREE.Points(geometry, material);
        rain.userData = { type: 'rain' };
        this.scene.add(rain);
        this.weatherParticles.push(rain);
    }

    createSnow() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 100,
                Math.random() * 50,
                (Math.random() - 0.5) * 100
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.8
        });

        const snow = new THREE.Points(geometry, material);
        snow.userData = { type: 'snow' };
        this.scene.add(snow);
        this.weatherParticles.push(snow);
    }

    createParticles(position, type) {
        if (!this.settings.particles) return;

        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(
                position.x + (Math.random() - 0.5),
                position.y + (Math.random() - 0.5),
                position.z + (Math.random() - 0.5)
            );
            velocities.push(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.1,
                (Math.random() - 0.5) * 0.1
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        let color = 0xffffff;
        if (type === 'dust') color = 0x8b7355;
        if (type === 'water') color = 0x4a90e2;
        if (type === 'explosion') color = 0xff4444;

        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.2,
            transparent: true,
            opacity: 1
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData = {
            type: 'particle',
            velocities: velocities,
            life: 1.0
        };

        this.scene.add(particles);
        this.particles.push(particles);
    }

    updateParticles() {
        this.particles.forEach((particleSystem, index) => {
            const positions = particleSystem.geometry.attributes.position.array;
            const velocities = particleSystem.userData.velocities;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];

                velocities[i + 1] -= 0.005; // Gravity
            }

            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.userData.life -= 0.02;
            particleSystem.material.opacity = particleSystem.userData.life;

            if (particleSystem.userData.life <= 0) {
                this.scene.remove(particleSystem);
                this.particles.splice(index, 1);
            }
        });
    }

    updateWeatherParticles() {
        this.weatherParticles.forEach(weather => {
            const positions = weather.geometry.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
                if (weather.userData.type === 'rain') {
                    positions[i + 1] -= 0.5;
                    if (positions[i + 1] < 0) {
                        positions[i + 1] = 50;
                    }
                } else if (weather.userData.type === 'snow') {
                    positions[i + 1] -= 0.1;
                    positions[i] += (Math.random() - 0.5) * 0.05;
                    if (positions[i + 1] < 0) {
                        positions[i + 1] = 50;
                    }
                }
            }

            weather.geometry.attributes.position.needsUpdate = true;
        });
    }

    updateVehicles() {
        this.vehicles.forEach(vehicle => {
            vehicle.position.x += vehicle.userData.speed;

            // Wrap around
            if (vehicle.position.x > 30) vehicle.position.x = -30;
            if (vehicle.position.x < -30) vehicle.position.x = 30;
        });
    }

    updateCollectibles() {
        this.collectibles.forEach((coin, index) => {
            // Rotate coins
            coin.rotation.y += 0.05;

            // Check collision with player
            const distance = this.player.position.distanceTo(coin.position);
            if (distance < 1) {
                this.collectCoin(coin, index);
            }
        });

        this.powerups.forEach((powerup, index) => {
            // Rotate powerups
            powerup.rotation.y += 0.05;
            powerup.position.y = 0.5 + Math.sin(Date.now() * 0.005) * 0.2;

            // Check collision with player
            const distance = this.player.position.distanceTo(powerup.position);
            if (distance < 1) {
                this.collectPowerup(powerup, index);
            }
        });
    }

    collectCoin(coin, index) {
        let coinValue = 1;

        // Double coins ability
        if (this.characters[this.selectedCharacter].ability === 'double_coins') {
            coinValue = 2;
        }

        // Multiplier powerup
        if (this.activePowerup === 'multiplier') {
            coinValue *= 2;
        }

        this.coins += coinValue;
        this.totalCoins += coinValue;
        this.updateCoins();

        this.createParticles(coin.position, 'dust');
        this.playSound('coin');
        this.scene.remove(coin);
        this.collectibles.splice(index, 1);

        this.saveData();
    }

    collectPowerup(powerup, index) {
        this.activatePowerup(powerup.userData.powerupType);
        this.createParticles(powerup.position, 'explosion');
        this.playSound('powerup');
        this.scene.remove(powerup);
        this.powerups.splice(index, 1);

        this.incrementAchievementCount('powerup_master');
    }

    activatePowerup(type) {
        this.activePowerup = type;
        this.powerupEndTime = Date.now() + 10000; // 10 seconds

        const indicator = document.getElementById('powerupIndicator');
        indicator.classList.remove('hidden');

        switch (type) {
            case 'speed':
                indicator.textContent = '⚡ SPEED BOOST';
                indicator.style.background = 'rgba(0, 255, 0, 0.8)';
                break;
            case 'invincibility':
                indicator.textContent = '🛡️ INVINCIBLE';
                indicator.style.background = 'rgba(255, 0, 255, 0.8)';
                this.player.material.color.setHex(0xff00ff);
                break;
            case 'magnet':
                indicator.textContent = '🧲 COIN MAGNET';
                indicator.style.background = 'rgba(0, 0, 255, 0.8)';
                break;
            case 'multiplier':
                indicator.textContent = '✨ 2X MULTIPLIER';
                indicator.style.background = 'rgba(255, 165, 0, 0.8)';
                break;
        }
    }

    updatePowerups() {
        if (this.activePowerup && Date.now() > this.powerupEndTime) {
            this.deactivatePowerup();
        }

        // Coin magnet effect
        if (this.activePowerup === 'magnet') {
            this.collectibles.forEach((coin, index) => {
                const distance = this.player.position.distanceTo(coin.position);
                if (distance < 5) {
                    const direction = new THREE.Vector3()
                        .subVectors(this.player.position, coin.position)
                        .normalize();
                    coin.position.add(direction.multiplyScalar(0.2));

                    if (distance < 1) {
                        this.collectCoin(coin, index);
                    }
                }
            });
        }
    }

    deactivatePowerup() {
        if (this.activePowerup === 'invincibility') {
            this.player.material.color.setHex(0xffcc00);
        }

        this.activePowerup = null;
        document.getElementById('powerupIndicator').classList.add('hidden');
    }

    checkCollisions() {
        if (this.activePowerup === 'invincibility') return;
        if (this.characters[this.selectedCharacter].ability === 'float') return;

        let playerOnLog = false;

        this.vehicles.forEach(vehicle => {
            const distance = new THREE.Vector2(
                this.player.position.x - vehicle.position.x,
                this.player.position.z - vehicle.position.z
            ).length();

            if (distance < 1.2) {
                if (vehicle.userData.type === 'log') {
                    // Player is on a log
                    playerOnLog = true;
                    this.player.position.x += vehicle.userData.speed;
                } else if (vehicle.userData.type === 'car' || vehicle.userData.type === 'train') {
                    // Hit by vehicle
                    this.gameOver();
                }
            }
        });

        // Check if player is in water without being on a log
        const playerLane = this.lanes.find(lane =>
            Math.abs(lane.z - this.player.position.z) < 0.5
        );

        if (playerLane && playerLane.type === 'river' && !playerOnLog) {
            this.gameOver();
        }
    }

    updateCamera() {
        // Smooth camera follow
        const targetX = this.player.position.x;
        const targetY = 15;
        const targetZ = this.player.position.z + 15;

        this.camera.position.x += (targetX - this.camera.position.x) * 0.1;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.1;
        this.camera.position.z += (targetZ - this.camera.position.z) * 0.1;

        this.camera.lookAt(this.player.position);
    }

    updateDayNightCycle() {
        // Cycle through day (0.1 hours per second)
        this.timeOfDay += 0.001;
        if (this.timeOfDay > 24) this.timeOfDay = 0;

        // Update lighting based on time of day
        const dayProgress = this.timeOfDay / 24;
        const sunAngle = dayProgress * Math.PI * 2;

        // Sun position
        this.sunLight.position.x = Math.cos(sunAngle) * 20;
        this.sunLight.position.y = Math.sin(sunAngle) * 20 + 10;

        // Light intensity
        if (this.timeOfDay > 6 && this.timeOfDay < 18) {
            // Day time
            this.sunLight.intensity = 0.8;
            this.ambientLight.intensity = 0.6;
            this.scene.fog.color.setHex(0x87ceeb);
        } else {
            // Night time
            this.sunLight.intensity = 0.2;
            this.ambientLight.intensity = 0.3;
            this.scene.fog.color.setHex(0x000033);
        }

        this.renderer.setClearColor(this.scene.fog.color);
    }

    updateScore() {
        document.getElementById('scoreValue').textContent = this.score;
    }

    updateCoins() {
        document.getElementById('coinsValue').textContent = this.coins;
    }

    updateCombo() {
        const comboElement = document.getElementById('comboValue');
        if (this.combo > 1) {
            comboElement.textContent = `${this.combo}x COMBO!`;
            comboElement.style.display = 'block';
        } else {
            comboElement.style.display = 'none';
        }
    }

    checkAchievements() {
        this.achievementList.forEach(achievement => {
            if (!this.achievements[achievement.id]) {
                if (achievement.count) {
                    // Count-based achievements are checked elsewhere
                } else if (achievement.condition && achievement.condition()) {
                    this.unlockAchievement(achievement);
                }
            }
        });
    }

    unlockAchievement(achievement) {
        this.achievements[achievement.id] = true;
        this.saveData();

        // Show notification
        this.showNotification(`🏆 Achievement Unlocked: ${achievement.name}`);
        this.playSound('achievement');
    }

    incrementAchievementCount(achievementId) {
        if (!this.achievements[achievementId]) {
            this.achievements[achievementId] = 1;
        } else {
            this.achievements[achievementId]++;
        }

        const achievement = this.achievementList.find(a => a.id === achievementId);
        if (achievement && this.achievements[achievementId] >= 10) {
            this.unlockAchievement(achievement);
        }

        this.saveData();
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: #ffd700;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 1.5em;
            font-weight: bold;
            z-index: 2000;
            animation: slideDown 0.5s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    playSound(type) {
        // Placeholder for sound effects
        // In a full implementation, you would use Web Audio API or Howler.js
        console.log(`Playing sound: ${type}`);
    }

    saveData() {
        localStorage.setItem('highScore', this.highScore);
        localStorage.setItem('totalCoins', this.totalCoins);
        localStorage.setItem('unlockedCharacters', JSON.stringify(this.unlockedCharacters));
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    gameOver() {
        if (this.gameState !== 'playing') return;

        this.gameState = 'gameover';
        this.createParticles(this.player.position, 'explosion');
        this.playSound('gameover');

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }

        this.saveData();
        this.showGameOverScreen();
    }

    showGameOverScreen() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHighScore').textContent = this.highScore;
        document.getElementById('finalCoins').textContent = this.coins;

        // Show newly unlocked achievements
        const newAchievements = document.getElementById('newAchievements');
        newAchievements.innerHTML = '';

        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('gameHUD').classList.add('hidden');
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.coins = 0;
        this.combo = 0;
        this.furthestLane = 0;
        this.activePowerup = null;

        // Reset player position
        this.player.position.set(0, 0.4, 0);

        // Clear and regenerate terrain
        this.lanes.forEach(lane => this.removeLane(lane));
        this.lanes = [];
        this.vehicles = [];
        this.collectibles = [];
        this.powerups = [];

        this.generateInitialTerrain();

        // Reset camera
        this.camera.position.set(0, 15, 15);

        // Show HUD
        document.getElementById('gameHUD').classList.remove('hidden');
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');

        this.updateScore();
        this.updateCoins();
        this.updateCombo();
    }

    setupUI() {
        // Main menu buttons
        document.getElementById('playBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('charactersBtn').addEventListener('click', () => {
            this.showCharacterMenu();
        });

        document.getElementById('achievementsBtn').addEventListener('click', () => {
            this.showAchievementsMenu();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsMenu();
        });

        // Game over buttons
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('menuBtn').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Back buttons
        document.getElementById('backFromCharacters').addEventListener('click', () => {
            this.showMainMenu();
        });

        document.getElementById('backFromAchievements').addEventListener('click', () => {
            this.showMainMenu();
        });

        document.getElementById('backFromSettings').addEventListener('click', () => {
            this.showMainMenu();
        });

        // Settings
        document.getElementById('musicVolume').addEventListener('input', (e) => {
            this.settings.musicVolume = e.target.value;
            document.getElementById('musicVolumeLabel').textContent = e.target.value;
        });

        document.getElementById('sfxVolume').addEventListener('input', (e) => {
            this.settings.sfxVolume = e.target.value;
            document.getElementById('sfxVolumeLabel').textContent = e.target.value;
        });

        document.getElementById('graphicsQuality').addEventListener('change', (e) => {
            this.settings.quality = e.target.value;
        });

        document.getElementById('particlesToggle').addEventListener('change', (e) => {
            this.settings.particles = e.target.checked;
        });

        document.getElementById('weatherToggle').addEventListener('change', (e) => {
            this.settings.weather = e.target.checked;
            if (!e.target.checked) {
                this.setWeather('clear');
            }
        });

        // Update initial UI
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('totalCoins').textContent = this.totalCoins;
    }

    showMainMenu() {
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('characterMenu').classList.add('hidden');
        document.getElementById('achievementsMenu').classList.add('hidden');
        document.getElementById('settingsMenu').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('gameHUD').classList.add('hidden');

        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('totalCoins').textContent = this.totalCoins;
    }

    showCharacterMenu() {
        const grid = document.getElementById('characterGrid');
        grid.innerHTML = '';

        Object.keys(this.characters).forEach(charId => {
            const char = this.characters[charId];
            const isUnlocked = this.unlockedCharacters.includes(charId);
            const isSelected = charId === this.selectedCharacter;

            const card = document.createElement('div');
            card.className = 'character-card';
            if (isSelected) card.classList.add('selected');
            if (!isUnlocked) card.classList.add('locked');

            card.innerHTML = `
                <div class="character-icon">${char.icon}</div>
                <div class="character-name">${char.name}</div>
                ${!isUnlocked ? `<div class="character-cost">🪙 ${char.cost}</div>` : ''}
            `;

            card.addEventListener('click', () => {
                if (isUnlocked) {
                    this.selectedCharacter = charId;
                    this.updatePlayerAppearance();
                    this.showCharacterMenu(); // Refresh
                } else if (this.totalCoins >= char.cost) {
                    this.totalCoins -= char.cost;
                    this.unlockedCharacters.push(charId);
                    this.selectedCharacter = charId;
                    this.updatePlayerAppearance();
                    this.saveData();
                    this.showCharacterMenu(); // Refresh
                    this.checkAchievements();
                }
            });

            grid.appendChild(card);
        });

        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('characterMenu').classList.remove('hidden');
    }

    showAchievementsMenu() {
        const list = document.getElementById('achievementsList');
        list.innerHTML = '';

        this.achievementList.forEach(achievement => {
            const isUnlocked = this.achievements[achievement.id];

            const item = document.createElement('div');
            item.className = 'achievement-item';
            if (isUnlocked) item.classList.add('unlocked');

            item.innerHTML = `
                <div class="achievement-icon">${isUnlocked ? '🏆' : '🔒'}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            `;

            list.appendChild(item);
        });

        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('achievementsMenu').classList.remove('hidden');
    }

    showSettingsMenu() {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('settingsMenu').classList.remove('hidden');
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 1000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.gameState === 'playing') {
            this.updateVehicles();
            this.updateCollectibles();
            this.updatePowerups();
            this.checkCollisions();
            this.updateCamera();
            this.updateDayNightCycle();
            this.updateParticles();
            this.updateWeatherParticles();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new Game();
});
