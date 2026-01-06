// ==================== GAME STATE ====================
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

let currentState = GameState.MENU;
let scene, camera, renderer;
let player, bots = [];
let obstacles = [];
let powerUps = [];
let bullets = [];
let particles = [];
let gameStartTime = 0;
let score = 0;
let kills = 0;
let shotsFired = 0;
let shotsHit = 0;

// Settings
let settings = {
    sensitivity: 5,
    volume: 70,
    graphicsQuality: 'medium',
    botCount: 8
};

// Input states
const keys = {};
let mouseX = 0, mouseY = 0;
let pointerLocked = false;

// ==================== WEAPON SYSTEM ====================
const WeaponTypes = {
    PISTOL: {
        name: 'PISTOL',
        damage: 25,
        fireRate: 400,
        maxAmmo: 12,
        reserveAmmo: 60,
        reloadTime: 1500,
        spread: 0.02,
        color: 0xffff00
    },
    ASSAULT_RIFLE: {
        name: 'ASSAULT RIFLE',
        damage: 20,
        fireRate: 120,
        maxAmmo: 30,
        reserveAmmo: 120,
        reloadTime: 2000,
        spread: 0.015,
        color: 0x00ff88
    },
    SHOTGUN: {
        name: 'SHOTGUN',
        damage: 15,
        fireRate: 800,
        maxAmmo: 8,
        reserveAmmo: 32,
        reloadTime: 2500,
        spread: 0.08,
        pellets: 8,
        color: 0xff4444
    },
    SNIPER: {
        name: 'SNIPER RIFLE',
        damage: 100,
        fireRate: 1200,
        maxAmmo: 5,
        reserveAmmo: 20,
        reloadTime: 3000,
        spread: 0.001,
        color: 0x00ffff
    }
};

class Weapon {
    constructor(type) {
        this.type = type;
        this.currentAmmo = type.maxAmmo;
        this.reserveAmmo = type.reserveAmmo;
        this.lastFireTime = 0;
        this.isReloading = false;
    }

    canFire() {
        const now = Date.now();
        return !this.isReloading &&
               this.currentAmmo > 0 &&
               (now - this.lastFireTime) >= this.type.fireRate;
    }

    fire() {
        if (this.canFire()) {
            this.currentAmmo--;
            this.lastFireTime = Date.now();
            return true;
        }
        return false;
    }

    reload() {
        if (this.isReloading || this.currentAmmo === this.type.maxAmmo || this.reserveAmmo === 0) {
            return;
        }

        this.isReloading = true;
        setTimeout(() => {
            const needed = this.type.maxAmmo - this.currentAmmo;
            const amount = Math.min(needed, this.reserveAmmo);
            this.currentAmmo += amount;
            this.reserveAmmo -= amount;
            this.isReloading = false;
        }, this.type.reloadTime);
    }

    addAmmo(amount) {
        this.reserveAmmo = Math.min(this.reserveAmmo + amount, this.type.reserveAmmo + 100);
    }
}

// ==================== PLAYER ====================
class Player {
    constructor() {
        this.position = new THREE.Vector3(0, 2, 0);
        this.velocity = new THREE.Vector3();
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 10;
        this.sprintMultiplier = 1.5;
        this.jumpForce = 8;
        this.isGrounded = true;

        // Weapon system
        this.weapons = [
            new Weapon(WeaponTypes.PISTOL),
            new Weapon(WeaponTypes.ASSAULT_RIFLE),
            new Weapon(WeaponTypes.SHOTGUN),
            new Weapon(WeaponTypes.SNIPER)
        ];
        this.currentWeaponIndex = 1;

        this.mesh = new THREE.Group();

        // Player collision box
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            wireframe: true,
            visible: false
        });
        this.collisionBox = new THREE.Mesh(geometry, material);
        this.mesh.add(this.collisionBox);
    }

    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }

    switchWeapon(index) {
        if (index >= 0 && index < this.weapons.length) {
            this.currentWeaponIndex = index;
            updateWeaponUI();
        }
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        updateHealthUI();

        if (this.health <= 0) {
            gameOver();
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        updateHealthUI();
    }

    update(deltaTime) {
        // Apply gravity
        if (!this.isGrounded) {
            this.velocity.y -= 20 * deltaTime;
        }

        // Movement
        const moveSpeed = this.speed * (keys['Shift'] ? this.sprintMultiplier : 1) * deltaTime;
        const direction = new THREE.Vector3();

        if (keys['w'] || keys['W']) direction.z -= 1;
        if (keys['s'] || keys['S']) direction.z += 1;
        if (keys['a'] || keys['A']) direction.x -= 1;
        if (keys['d'] || keys['D']) direction.x += 1;

        if (direction.length() > 0) {
            direction.normalize();
            direction.applyEuler(this.rotation);
            direction.y = 0;
            direction.normalize();

            this.velocity.x = direction.x * moveSpeed * 10;
            this.velocity.z = direction.z * moveSpeed * 10;
        } else {
            this.velocity.x *= 0.9;
            this.velocity.z *= 0.9;
        }

        // Jump
        if (keys[' '] && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Collision with ground
        if (this.position.y <= 2) {
            this.position.y = 2;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        // Collision with obstacles
        this.checkCollisions();

        // Keep in bounds
        const bound = 48;
        this.position.x = Math.max(-bound, Math.min(bound, this.position.x));
        this.position.z = Math.max(-bound, Math.min(bound, this.position.z));

        this.mesh.position.copy(this.position);

        // Update camera
        camera.position.copy(this.position);
        camera.rotation.copy(this.rotation);
    }

    checkCollisions() {
        const playerBox = new THREE.Box3().setFromCenterAndSize(
            this.position,
            new THREE.Vector3(1, 2, 1)
        );

        for (const obstacle of obstacles) {
            if (playerBox.intersectsBox(obstacle.box)) {
                // Simple push-out collision
                const dx = this.position.x - obstacle.position.x;
                const dz = this.position.z - obstacle.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                if (distance > 0) {
                    const pushX = (dx / distance) * 0.5;
                    const pushZ = (dz / distance) * 0.5;
                    this.position.x += pushX;
                    this.position.z += pushZ;
                }
            }
        }
    }
}

// ==================== BOT AI ====================
class Bot {
    constructor(position) {
        this.position = position.clone();
        this.velocity = new THREE.Vector3();
        this.rotation = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 6;
        this.state = 'patrol'; // patrol, chase, attack
        this.target = null;
        this.lastShot = 0;
        this.fireRate = 800;
        this.patrolTarget = this.getRandomPatrolPoint();
        this.reactionTime = Math.random() * 500 + 500;
        this.lastSawPlayer = 0;

        // Visual mesh
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff4444,
            emissive: 0x440000
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);

        // Add glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 0.5, 0.5);
        this.mesh.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 0.5, 0.5);
        this.mesh.add(rightEye);

        scene.add(this.mesh);
    }

    getRandomPatrolPoint() {
        return new THREE.Vector3(
            Math.random() * 80 - 40,
            2,
            Math.random() * 80 - 40
        );
    }

    update(deltaTime) {
        const distanceToPlayer = this.position.distanceTo(player.position);
        const canSeePlayer = this.canSee(player.position);

        // State machine
        if (canSeePlayer && distanceToPlayer < 30) {
            this.state = 'chase';
            this.target = player.position.clone();
            this.lastSawPlayer = Date.now();
        } else if (Date.now() - this.lastSawPlayer < 3000) {
            this.state = 'chase';
        } else {
            this.state = 'patrol';
            if (this.position.distanceTo(this.patrolTarget) < 2) {
                this.patrolTarget = this.getRandomPatrolPoint();
            }
            this.target = this.patrolTarget;
        }

        // Movement
        if (this.target) {
            const direction = new THREE.Vector3()
                .subVectors(this.target, this.position)
                .normalize();

            direction.y = 0;

            if (this.state === 'patrol' || distanceToPlayer > 8) {
                this.velocity.x = direction.x * this.speed;
                this.velocity.z = direction.z * this.speed;
            } else {
                // Stop moving when close to player (attack mode)
                this.velocity.x *= 0.9;
                this.velocity.z *= 0.9;
            }

            // Rotation
            this.rotation = Math.atan2(direction.x, direction.z);
        }

        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Collision with obstacles
        this.checkCollisions();

        // Keep in bounds
        const bound = 48;
        this.position.x = Math.max(-bound, Math.min(bound, this.position.x));
        this.position.z = Math.max(-bound, Math.min(bound, this.position.z));

        // Shooting
        if (this.state === 'chase' && canSeePlayer && distanceToPlayer < 25) {
            this.tryShoot();
        }

        // Update mesh
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
    }

    canSee(targetPos) {
        const direction = new THREE.Vector3()
            .subVectors(targetPos, this.position)
            .normalize();

        const raycaster = new THREE.Raycaster(this.position, direction);
        const intersects = raycaster.intersectObjects(
            obstacles.map(o => o.mesh)
        );

        const distance = this.position.distanceTo(targetPos);

        return intersects.length === 0 || intersects[0].distance > distance;
    }

    checkCollisions() {
        const botBox = new THREE.Box3().setFromCenterAndSize(
            this.position,
            new THREE.Vector3(1, 2, 1)
        );

        for (const obstacle of obstacles) {
            if (botBox.intersectsBox(obstacle.box)) {
                const dx = this.position.x - obstacle.position.x;
                const dz = this.position.z - obstacle.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                if (distance > 0) {
                    const pushX = (dx / distance) * 0.5;
                    const pushZ = (dz / distance) * 0.5;
                    this.position.x += pushX;
                    this.position.z += pushZ;
                }
            }
        }
    }

    tryShoot() {
        const now = Date.now();
        if (now - this.lastShot >= this.fireRate) {
            this.lastShot = now;

            const direction = new THREE.Vector3()
                .subVectors(player.position, this.position)
                .normalize();

            // Add some inaccuracy
            direction.x += (Math.random() - 0.5) * 0.1;
            direction.y += (Math.random() - 0.5) * 0.1;
            direction.z += (Math.random() - 0.5) * 0.1;
            direction.normalize();

            createBullet(this.position.clone(), direction, 0xff4444, 15, true);
            createMuzzleFlash(this.position.clone(), 0xff4444);
        }
    }

    takeDamage(amount) {
        this.health -= amount;

        // Flash red when hit
        this.mesh.material.emissive.setHex(0xff0000);
        setTimeout(() => {
            if (this.mesh && this.mesh.material) {
                this.mesh.material.emissive.setHex(0x440000);
            }
        }, 100);

        if (this.health <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }

    destroy() {
        scene.remove(this.mesh);
        const index = bots.indexOf(this);
        if (index > -1) {
            bots.splice(index, 1);
        }

        // Create explosion effect
        createExplosion(this.position, 0xff4444);

        // Spawn new bot
        setTimeout(() => {
            if (currentState === GameState.PLAYING) {
                spawnBot();
            }
        }, 3000);
    }
}

// ==================== OBSTACLES ====================
class Obstacle {
    constructor(position, size) {
        this.position = position;
        this.size = size;

        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshPhongMaterial({
            color: 0x333333,
            emissive: 0x111111
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        scene.add(this.mesh);

        this.box = new THREE.Box3().setFromCenterAndSize(position, size);
    }
}

// ==================== POWER-UPS ====================
class PowerUp {
    constructor(position, type) {
        this.position = position;
        this.type = type; // 'health', 'ammo', 'speed'
        this.rotationSpeed = 2;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        let color;

        switch(type) {
            case 'health':
                color = 0x00ff00;
                break;
            case 'ammo':
                color = 0xffff00;
                break;
            case 'speed':
                color = 0x00ffff;
                break;
        }

        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);

        // Add glow effect
        const glowGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glow);

        scene.add(this.mesh);
    }

    update(deltaTime) {
        this.mesh.rotation.y += this.rotationSpeed * deltaTime;
        this.glow.rotation.x += this.rotationSpeed * deltaTime * 0.5;

        // Bob up and down
        this.mesh.position.y = this.position.y + Math.sin(Date.now() * 0.002) * 0.3;

        // Check collision with player
        const distance = this.position.distanceTo(player.position);
        if (distance < 2) {
            this.collect();
        }
    }

    collect() {
        switch(this.type) {
            case 'health':
                player.heal(50);
                addKillFeedMessage('+ 50 HEALTH', true);
                break;
            case 'ammo':
                player.getCurrentWeapon().addAmmo(60);
                addKillFeedMessage('+ AMMO', true);
                break;
            case 'speed':
                player.speed *= 1.5;
                setTimeout(() => { player.speed /= 1.5; }, 10000);
                addKillFeedMessage('SPEED BOOST!', true);
                break;
        }

        scene.remove(this.mesh);
        const index = powerUps.indexOf(this);
        if (index > -1) {
            powerUps.splice(index, 1);
        }
    }
}

// ==================== PROJECTILES ====================
class Bullet {
    constructor(position, direction, color, damage, fromBot = false) {
        this.position = position;
        this.direction = direction;
        this.speed = 100;
        this.damage = damage;
        this.lifetime = 2;
        this.age = 0;
        this.fromBot = fromBot;

        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);

        scene.add(this.mesh);
    }

    update(deltaTime) {
        this.age += deltaTime;

        if (this.age > this.lifetime) {
            this.destroy();
            return;
        }

        const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.position.add(movement);
        this.mesh.position.copy(this.position);

        // Check collisions
        if (this.checkCollisions()) {
            this.destroy();
        }
    }

    checkCollisions() {
        // Hit obstacles
        for (const obstacle of obstacles) {
            if (obstacle.box.containsPoint(this.position)) {
                createImpactEffect(this.position, this.mesh.material.color.getHex());
                return true;
            }
        }

        // Hit player
        if (!this.fromBot && bots.length > 0) {
            for (const bot of bots) {
                const distance = this.position.distanceTo(bot.position);
                if (distance < 1) {
                    if (bot.takeDamage(this.damage)) {
                        score += 100;
                        kills++;
                        updateScoreUI();
                        addKillFeedMessage('You eliminated a bot!', true);
                    }
                    shotsHit++;
                    createImpactEffect(this.position, 0xff4444);
                    return true;
                }
            }
        }

        // Hit player from bot
        if (this.fromBot) {
            const distance = this.position.distanceTo(player.position);
            if (distance < 1) {
                player.takeDamage(this.damage);
                createImpactEffect(this.position, 0x00ff88);
                return true;
            }
        }

        return false;
    }

    destroy() {
        scene.remove(this.mesh);
        const index = bullets.indexOf(this);
        if (index > -1) {
            bullets.splice(index, 1);
        }
    }
}

function createBullet(position, direction, color, damage, fromBot = false) {
    bullets.push(new Bullet(position, direction, color, damage, fromBot));
}

// ==================== PARTICLE EFFECTS ====================
class Particle {
    constructor(position, velocity, color, lifetime) {
        this.position = position;
        this.velocity = velocity;
        this.lifetime = lifetime;
        this.age = 0;
        this.color = color;

        const geometry = new THREE.SphereGeometry(0.1, 4, 4);
        const material = new THREE.MeshBasicMaterial({ color: color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);

        scene.add(this.mesh);
    }

    update(deltaTime) {
        this.age += deltaTime;

        if (this.age > this.lifetime) {
            this.destroy();
            return false;
        }

        this.velocity.y -= 9.8 * deltaTime;
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.mesh.position.copy(this.position);

        const lifeRatio = 1 - (this.age / this.lifetime);
        this.mesh.scale.setScalar(lifeRatio);
        this.mesh.material.opacity = lifeRatio;
        this.mesh.material.transparent = true;

        return true;
    }

    destroy() {
        scene.remove(this.mesh);
        const index = particles.indexOf(this);
        if (index > -1) {
            particles.splice(index, 1);
        }
    }
}

function createMuzzleFlash(position, color) {
    for (let i = 0; i < 5; i++) {
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        );
        particles.push(new Particle(position.clone(), velocity, color, 0.1));
    }
}

function createImpactEffect(position, color) {
    for (let i = 0; i < 8; i++) {
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            Math.random() * 3,
            (Math.random() - 0.5) * 5
        );
        particles.push(new Particle(position.clone(), velocity, color, 0.5));
    }
}

function createExplosion(position, color) {
    for (let i = 0; i < 30; i++) {
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            Math.random() * 8,
            (Math.random() - 0.5) * 10
        );
        particles.push(new Particle(position.clone(), velocity, color, 1));
    }
}

// ==================== INITIALIZATION ====================
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 20, 100);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Add some colored point lights for atmosphere
    const light1 = new THREE.PointLight(0x00ff88, 1, 30);
    light1.position.set(20, 5, 20);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xff0088, 1, 30);
    light2.position.set(-20, 5, -20);
    scene.add(light2);

    const light3 = new THREE.PointLight(0x0088ff, 1, 30);
    light3.position.set(-20, 5, 20);
    scene.add(light3);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a2e,
        emissive: 0x0a0a1a
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const gridHelper = new THREE.GridHelper(100, 50, 0x00ff88, 0x003333);
    scene.add(gridHelper);

    // Create obstacles
    createObstacles();

    // Player
    player = new Player();
    scene.add(player.mesh);

    // Setup controls
    setupControls();

    // Setup UI
    setupUI();

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1000);

    // Start animation loop
    animate();
}

function createObstacles() {
    // Create walls around the arena
    const wallHeight = 5;
    const wallThickness = 1;
    const arenaSize = 50;

    // North wall
    obstacles.push(new Obstacle(
        new THREE.Vector3(0, wallHeight / 2, -arenaSize),
        new THREE.Vector3(arenaSize * 2, wallHeight, wallThickness)
    ));

    // South wall
    obstacles.push(new Obstacle(
        new THREE.Vector3(0, wallHeight / 2, arenaSize),
        new THREE.Vector3(arenaSize * 2, wallHeight, wallThickness)
    ));

    // East wall
    obstacles.push(new Obstacle(
        new THREE.Vector3(arenaSize, wallHeight / 2, 0),
        new THREE.Vector3(wallThickness, wallHeight, arenaSize * 2)
    ));

    // West wall
    obstacles.push(new Obstacle(
        new THREE.Vector3(-arenaSize, wallHeight / 2, 0),
        new THREE.Vector3(wallThickness, wallHeight, arenaSize * 2)
    ));

    // Create random cover obstacles
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 80 - 40;
        const z = Math.random() * 80 - 40;
        const width = Math.random() * 3 + 2;
        const height = Math.random() * 4 + 2;
        const depth = Math.random() * 3 + 2;

        obstacles.push(new Obstacle(
            new THREE.Vector3(x, height / 2, z),
            new THREE.Vector3(width, height, depth)
        ));
    }
}

function spawnBot() {
    let position;
    let tooClose;

    do {
        position = new THREE.Vector3(
            Math.random() * 80 - 40,
            2,
            Math.random() * 80 - 40
        );
        tooClose = position.distanceTo(player.position) < 15;
    } while (tooClose);

    bots.push(new Bot(position));
}

function spawnPowerUp() {
    const types = ['health', 'ammo', 'speed'];
    const type = types[Math.floor(Math.random() * types.length)];

    const position = new THREE.Vector3(
        Math.random() * 80 - 40,
        2,
        Math.random() * 80 - 40
    );

    powerUps.push(new PowerUp(position, type));
}

// ==================== CONTROLS ====================
function setupControls() {
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;

        if (currentState === GameState.PLAYING) {
            // Weapon switching
            if (e.key >= '1' && e.key <= '4') {
                player.switchWeapon(parseInt(e.key) - 1);
            }

            // Reload
            if (e.key === 'r' || e.key === 'R') {
                player.getCurrentWeapon().reload();
            }

            // Pause
            if (e.key === 'Escape') {
                pauseGame();
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    document.addEventListener('mousemove', (e) => {
        if (!pointerLocked) return;

        const sensitivity = settings.sensitivity * 0.002;
        mouseX = e.movementX * sensitivity;
        mouseY = e.movementY * sensitivity;

        player.rotation.y -= mouseX;
        player.rotation.x -= mouseY;

        const maxPitch = Math.PI / 2 - 0.1;
        player.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, player.rotation.x));
    });

    document.addEventListener('mousedown', (e) => {
        if (!pointerLocked || currentState !== GameState.PLAYING) return;

        if (e.button === 0) { // Left click
            shoot();
        }
    });

    // Pointer lock
    renderer.domElement.addEventListener('click', () => {
        if (currentState === GameState.PLAYING) {
            renderer.domElement.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        pointerLocked = document.pointerLockElement === renderer.domElement;

        const clickOverlay = document.getElementById('clickToPlay');
        if (currentState === GameState.PLAYING) {
            clickOverlay.classList.toggle('active', !pointerLocked);
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function shoot() {
    const weapon = player.getCurrentWeapon();

    if (!weapon.fire()) {
        // Out of ammo or can't fire
        return;
    }

    shotsFired++;

    const pellets = weapon.type.pellets || 1;

    for (let i = 0; i < pellets; i++) {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(player.rotation);

        // Add spread
        direction.x += (Math.random() - 0.5) * weapon.type.spread;
        direction.y += (Math.random() - 0.5) * weapon.type.spread;
        direction.z += (Math.random() - 0.5) * weapon.type.spread;
        direction.normalize();

        const bulletStart = player.position.clone();
        bulletStart.y += 1.5; // Shoot from eye level

        createBullet(bulletStart, direction, weapon.type.color, weapon.type.damage);
    }

    createMuzzleFlash(player.position.clone(), weapon.type.color);
    updateWeaponUI();
}

// ==================== UI ====================
function setupUI() {
    // Main menu buttons
    document.getElementById('playBtn').addEventListener('click', startGame);
    document.getElementById('controlsBtn').addEventListener('click', () => {
        document.getElementById('mainMenu').classList.remove('active');
        document.getElementById('controlsMenu').classList.add('active');
    });
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('mainMenu').classList.remove('active');
        document.getElementById('settingsMenu').classList.add('active');
    });

    // Back buttons
    document.getElementById('backFromControls').addEventListener('click', () => {
        document.getElementById('controlsMenu').classList.remove('active');
        document.getElementById('mainMenu').classList.add('active');
    });
    document.getElementById('backFromSettings').addEventListener('click', () => {
        document.getElementById('settingsMenu').classList.remove('active');
        document.getElementById('mainMenu').classList.add('active');
    });

    // Pause menu buttons
    document.getElementById('resumeBtn').addEventListener('click', resumeGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('mainMenuBtn').addEventListener('click', backToMainMenu);

    // Game over buttons
    document.getElementById('playAgainBtn').addEventListener('click', restartGame);
    document.getElementById('backToMenuBtn').addEventListener('click', backToMainMenu);

    // Settings
    const sensitivitySlider = document.getElementById('sensitivitySlider');
    const sensitivityValue = document.getElementById('sensitivityValue');
    sensitivitySlider.addEventListener('input', (e) => {
        settings.sensitivity = parseInt(e.target.value);
        sensitivityValue.textContent = e.target.value;
    });

    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    volumeSlider.addEventListener('input', (e) => {
        settings.volume = parseInt(e.target.value);
        volumeValue.textContent = e.target.value;
    });

    const botCountSlider = document.getElementById('botCountSlider');
    const botCountValue = document.getElementById('botCountValue');
    botCountSlider.addEventListener('input', (e) => {
        settings.botCount = parseInt(e.target.value);
        botCountValue.textContent = e.target.value;
    });

    const graphicsQuality = document.getElementById('graphicsQuality');
    graphicsQuality.addEventListener('change', (e) => {
        settings.graphicsQuality = e.target.value;
    });
}

function updateHealthUI() {
    const healthBar = document.getElementById('healthBar');
    const healthText = document.getElementById('healthText');

    const healthPercent = (player.health / player.maxHealth) * 100;
    healthBar.style.width = healthPercent + '%';
    healthText.textContent = Math.ceil(player.health);

    if (healthPercent < 30) {
        healthBar.classList.add('low');
    } else {
        healthBar.classList.remove('low');
    }
}

function updateWeaponUI() {
    const weapon = player.getCurrentWeapon();
    document.getElementById('weaponName').textContent = weapon.type.name;
    document.getElementById('ammoCurrent').textContent = weapon.currentAmmo;
    document.getElementById('ammoReserve').textContent = weapon.reserveAmmo;
}

function updateScoreUI() {
    document.getElementById('scoreValue').textContent = score;
}

function addKillFeedMessage(message, isPlayer) {
    const killFeed = document.getElementById('killFeed');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'kill-message ' + (isPlayer ? 'player-kill' : 'bot-kill');
    messageDiv.textContent = message;
    killFeed.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function updateMinimap() {
    const canvas = document.getElementById('minimapCanvas');
    const ctx = canvas.getContext('2d');

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = 1.5;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw obstacles
    ctx.fillStyle = '#333';
    obstacles.forEach(obstacle => {
        const x = centerX + (obstacle.position.x - player.position.x) * scale;
        const y = centerY + (obstacle.position.z - player.position.z) * scale;
        ctx.fillRect(x - 2, y - 2, 4, 4);
    });

    // Draw bots
    ctx.fillStyle = '#ff4444';
    bots.forEach(bot => {
        const x = centerX + (bot.position.x - player.position.x) * scale;
        const y = centerY + (bot.position.z - player.position.z) * scale;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw power-ups
    ctx.fillStyle = '#ffff00';
    powerUps.forEach(powerUp => {
        const x = centerX + (powerUp.position.x - player.position.x) * scale;
        const y = centerY + (powerUp.position.z - player.position.z) * scale;
        ctx.fillRect(x - 2, y - 2, 4, 4);
    });

    // Draw player
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw player direction
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + Math.sin(player.rotation.y) * 15,
        centerY + Math.cos(player.rotation.y) * 15
    );
    ctx.stroke();
}

// ==================== GAME STATES ====================
function startGame() {
    currentState = GameState.PLAYING;
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('hud').classList.add('active');

    // Reset game
    score = 0;
    kills = 0;
    shotsFired = 0;
    shotsHit = 0;
    gameStartTime = Date.now();

    player.health = 100;
    player.position.set(0, 2, 0);

    // Reset weapons
    player.weapons = [
        new Weapon(WeaponTypes.PISTOL),
        new Weapon(WeaponTypes.ASSAULT_RIFLE),
        new Weapon(WeaponTypes.SHOTGUN),
        new Weapon(WeaponTypes.SNIPER)
    ];
    player.currentWeaponIndex = 1;

    // Clear entities
    bots.forEach(bot => scene.remove(bot.mesh));
    bots = [];
    bullets.forEach(bullet => scene.remove(bullet.mesh));
    bullets = [];
    particles.forEach(particle => scene.remove(particle.mesh));
    particles = [];
    powerUps.forEach(powerUp => scene.remove(powerUp.mesh));
    powerUps = [];

    // Spawn bots
    for (let i = 0; i < settings.botCount; i++) {
        spawnBot();
    }

    // Spawn initial power-ups
    for (let i = 0; i < 5; i++) {
        spawnPowerUp();
    }

    updateHealthUI();
    updateWeaponUI();
    updateScoreUI();

    // Request pointer lock
    setTimeout(() => {
        renderer.domElement.requestPointerLock();
    }, 100);
}

function pauseGame() {
    if (currentState !== GameState.PLAYING) return;

    currentState = GameState.PAUSED;
    document.getElementById('pauseMenu').classList.add('active');
    document.exitPointerLock();
}

function resumeGame() {
    currentState = GameState.PLAYING;
    document.getElementById('pauseMenu').classList.remove('active');
    renderer.domElement.requestPointerLock();
}

function restartGame() {
    document.getElementById('pauseMenu').classList.remove('active');
    document.getElementById('gameOverMenu').classList.remove('active');
    startGame();
}

function backToMainMenu() {
    currentState = GameState.MENU;
    document.getElementById('pauseMenu').classList.remove('active');
    document.getElementById('gameOverMenu').classList.remove('active');
    document.getElementById('hud').classList.remove('active');
    document.getElementById('mainMenu').classList.add('active');
    document.exitPointerLock();
}

function gameOver() {
    currentState = GameState.GAME_OVER;
    document.getElementById('hud').classList.remove('active');
    document.getElementById('gameOverMenu').classList.add('active');
    document.exitPointerLock();

    // Calculate stats
    const timeAlive = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(timeAlive / 60);
    const seconds = timeAlive % 60;
    const accuracy = shotsFired > 0 ? Math.floor((shotsHit / shotsFired) * 100) : 0;

    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalKills').textContent = kills;
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ==================== GAME LOOP ====================
let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (currentState === GameState.PLAYING) {
        // Update player
        player.update(deltaTime);

        // Update bots
        bots.forEach(bot => bot.update(deltaTime));

        // Update bullets
        bullets.forEach(bullet => bullet.update(deltaTime));

        // Update particles
        particles.forEach(particle => particle.update(deltaTime));

        // Update power-ups
        powerUps.forEach(powerUp => powerUp.update(deltaTime));

        // Spawn power-ups randomly
        if (Math.random() < 0.001 && powerUps.length < 10) {
            spawnPowerUp();
        }

        // Update minimap
        updateMinimap();

        // Update score over time
        score += Math.floor(deltaTime * 10);
        updateScoreUI();
    }

    renderer.render(scene, camera);
}

// ==================== START ====================
window.addEventListener('load', () => {
    // Simulate loading
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
        }
        document.getElementById('loadingProgress').style.width = progress + '%';
    }, 200);

    init();
});
