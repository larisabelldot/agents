// Power-ups system (mushrooms, fire flowers, stars)

class PowerUp {
    constructor(scene, physics, position, type = 'mushroom') {
        this.scene = scene;
        this.physics = physics;
        this.type = type;
        this.position = position.clone();
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.collected = false;
        this.active = true;

        // Physics
        this.size = new THREE.Vector3(0.8, 0.8, 0.8);
        this.boundingBox = new THREE.Box3();

        // Movement (mushrooms move)
        if (type === 'mushroom') {
            this.speed = 2;
            this.direction = 1;
        }

        this.createModel();
        Utils.updateBoundingBox(this.boundingBox, this.position, this.size);

        if (type === 'mushroom') {
            this.physics.addObject(this);
        }
    }

    createModel() {
        this.model = new THREE.Group();

        if (this.type === 'mushroom') {
            // Mushroom cap (red with white spots)
            const capGeometry = new THREE.SphereGeometry(0.5, 12, 8);
            const capMaterial = new THREE.MeshLambertMaterial({
                color: 0xff0000,
                emissive: 0x880000,
                emissiveIntensity: 0.2
            });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.y = 0.5;
            cap.scale.y = 0.7;
            this.model.add(cap);

            // White spots on cap
            const spotGeometry = new THREE.CircleGeometry(0.15, 8);
            const spotMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

            const spotPositions = [
                [0, 0.75, 0.3],
                [-0.25, 0.65, 0.15],
                [0.25, 0.65, 0.15]
            ];

            spotPositions.forEach(pos => {
                const spot = new THREE.Mesh(spotGeometry, spotMaterial);
                spot.position.set(...pos);
                spot.lookAt(new THREE.Vector3(pos[0], pos[1] + 1, pos[2]));
                this.model.add(spot);
            });

            // Stem (beige/white)
            const stemGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.4, 8);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0xffffcc });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.2;
            this.model.add(stem);

        } else if (this.type === 'fireflower') {
            // Fire flower
            // Center
            const centerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const centerMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
            const center = new THREE.Mesh(centerGeometry, centerMaterial);
            center.position.y = 0.5;
            this.model.add(center);

            // Petals
            const petalGeometry = new THREE.SphereGeometry(0.25, 8, 8);
            const petalMaterial = new THREE.MeshLambertMaterial({
                color: 0xff6600,
                emissive: 0xff3300,
                emissiveIntensity: 0.3
            });

            const petalCount = 5;
            for (let i = 0; i < petalCount; i++) {
                const angle = (Math.PI * 2 * i) / petalCount;
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                petal.position.set(
                    Math.cos(angle) * 0.4,
                    0.5,
                    Math.sin(angle) * 0.4
                );
                petal.scale.set(0.8, 1, 0.5);
                this.model.add(petal);
            }

            // Stem
            const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
            const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.25;
            this.model.add(stem);

        } else if (this.type === 'starman') {
            // Invincibility star
            const starShape = new THREE.Shape();
            const outerRadius = 0.5;
            const innerRadius = 0.2;
            const points = 5;

            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                if (i === 0) {
                    starShape.moveTo(x, y);
                } else {
                    starShape.lineTo(x, y);
                }
            }
            starShape.closePath();

            const extrudeSettings = {
                depth: 0.3,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.1,
                bevelSegments: 3
            };

            const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
            const starMaterial = new THREE.MeshLambertMaterial({
                color: 0xffff00,
                emissive: 0xffdd00,
                emissiveIntensity: 0.7
            });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(0, 0.5, -0.15);
            this.model.add(star);

            this.speed = 3;
            this.direction = 1;
            this.physics.addObject(this);
        }

        this.model.position.copy(this.position);
        this.scene.add(this.model);
    }

    update(deltaTime) {
        if (!this.active) return;

        // Rotate for visual effect
        this.model.rotation.y += 2 * deltaTime;

        // Mushrooms and stars move
        if (this.type === 'mushroom' || this.type === 'starman') {
            this.velocity.x = this.direction * this.speed;
            this.velocity.y += this.physics.gravity * deltaTime;

            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;

            Utils.updateBoundingBox(this.boundingBox, this.position, this.size);

            // Resolve collisions
            const collision = this.physics.resolveCollision(this.position, this.size, this.velocity);
            if (collision === 'wall') {
                this.direction *= -1;
            }

            Utils.updateBoundingBox(this.boundingBox, this.position, this.size);
        } else {
            // Fire flower stays in place but bobs
            const time = Date.now() * 0.001;
            this.model.position.y = this.position.y + Math.sin(time * 2) * 0.1;
        }

        this.model.position.x = this.position.x;
        this.model.position.z = this.position.z;

        // Remove if fallen
        if (this.position.y < -20) {
            this.remove();
        }
    }

    collect(player) {
        if (this.collected) return;

        this.collected = true;
        this.active = false;

        if (this.type === 'mushroom') {
            player.powerUp();
        } else if (this.type === 'fireflower') {
            player.powerUp();
            player.powerUpState = 'fire';
        } else if (this.type === 'starman') {
            player.invincible = true;
            player.invincibilityTimer = 10.0;
            if (window.audioManager) window.audioManager.playStarTheme();
        }

        // Remove with animation
        const startTime = Date.now();
        const duration = 300;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.model.scale.y = 1 + progress * 2;
            this.model.position.y += 0.05;

            this.model.children.forEach(child => {
                if (child.material) {
                    child.material.opacity = 1 - progress;
                    child.material.transparent = true;
                }
            });

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.remove();
            }
        };

        animate();
    }

    remove() {
        this.scene.remove(this.model);
        this.physics.removeObject(this);
        this.active = false;
    }
}

class PowerUpManager {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.powerUps = [];
    }

    spawnPowerUp(position, type = 'mushroom') {
        const powerUp = new PowerUp(this.scene, this.physics, position, type);
        this.powerUps.push(powerUp);
        return powerUp;
    }

    update(deltaTime, player) {
        this.powerUps.forEach(powerUp => {
            if (powerUp.active) {
                powerUp.update(deltaTime);

                // Check collision with player
                if (Utils.boxIntersectsBox(player.boundingBox, powerUp.boundingBox)) {
                    powerUp.collect(player);
                }
            }
        });

        // Remove collected power-ups
        this.powerUps = this.powerUps.filter(p => p.active || !p.collected);
    }

    clear() {
        this.powerUps.forEach(p => p.remove());
        this.powerUps = [];
    }
}
