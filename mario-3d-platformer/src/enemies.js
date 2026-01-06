// Enemy system with AI behavior

class Enemy {
    constructor(scene, physics, position, type = 'goomba') {
        this.scene = scene;
        this.physics = physics;
        this.type = type;
        this.active = true;
        this.defeated = false;

        // Physics properties
        this.position = position.clone();
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.size = new THREE.Vector3(1, 1, 1);
        this.boundingBox = new THREE.Box3();

        // AI properties
        this.moveDirection = 1;
        this.speed = 2;
        this.patrolDistance = 10;
        this.startPosition = position.clone();

        // Create model based on type
        this.createModel();

        // Add to physics
        this.physics.addObject(this);
    }

    createModel() {
        this.model = new THREE.Group();

        if (this.type === 'goomba') {
            // Goomba-style enemy (mushroom-like)
            const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.8, 8);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.4;
            this.model.add(body);

            // Head/cap
            const headGeometry = new THREE.SphereGeometry(0.5, 8, 6);
            const headMaterial = new THREE.MeshLambertMaterial({ color: 0xd2691e });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 0.9;
            head.scale.y = 0.6;
            this.model.add(head);

            // Eyes
            const eyeGeometry = new THREE.SphereGeometry(0.1, 6, 6);
            const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            leftEye.position.set(-0.2, 0.9, 0.4);
            this.model.add(leftEye);

            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            rightEye.position.set(0.2, 0.9, 0.4);
            this.model.add(rightEye);

            // Feet
            const footGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.4);
            const footMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
            const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
            leftFoot.position.set(-0.25, 0, 0);
            this.model.add(leftFoot);

            const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
            rightFoot.position.set(0.25, 0, 0);
            this.model.add(rightFoot);

            this.leftFoot = leftFoot;
            this.rightFoot = rightFoot;
        } else if (this.type === 'koopa') {
            // Koopa/Turtle-style enemy
            // Shell
            const shellGeometry = new THREE.SphereGeometry(0.6, 12, 8);
            const shellMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
            const shell = new THREE.Mesh(shellGeometry, shellMaterial);
            shell.position.y = 0.5;
            shell.scale.y = 0.7;
            this.model.add(shell);

            // Head
            const headGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.6);
            const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.set(0, 0.6, 0.6);
            this.model.add(head);

            // Legs
            const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8);
            const legMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });

            const positions = [
                [-0.3, 0.2, 0.3],
                [0.3, 0.2, 0.3],
                [-0.3, 0.2, -0.3],
                [0.3, 0.2, -0.3]
            ];

            positions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(...pos);
                this.model.add(leg);
            });

            this.size.set(1.2, 1.2, 1.2);
        }

        this.scene.add(this.model);
        this.updateModelPosition();
    }

    update(deltaTime) {
        if (!this.active || this.defeated) return;

        // Simple patrol AI
        this.velocity.x = this.moveDirection * this.speed;

        // Check if reached patrol boundary
        const distanceFromStart = this.position.x - this.startPosition.x;
        if (Math.abs(distanceFromStart) > this.patrolDistance) {
            this.moveDirection *= -1;
        }

        // Apply gravity
        this.velocity.y += this.physics.gravity * deltaTime;

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Update bounding box
        Utils.updateBoundingBox(this.boundingBox, this.position, this.size);

        // Check collisions
        this.physics.resolveCollision(this.position, this.size, this.velocity);

        // Update bounding box after collision
        Utils.updateBoundingBox(this.boundingBox, this.position, this.size);

        // Simple walking animation
        if (this.leftFoot && this.rightFoot) {
            const time = Date.now() * 0.005;
            this.leftFoot.position.y = Math.abs(Math.sin(time)) * 0.1;
            this.rightFoot.position.y = Math.abs(Math.sin(time + Math.PI)) * 0.1;
        }

        // Update model
        this.updateModelPosition();

        // Remove if fallen off map
        if (this.position.y < -20) {
            this.remove();
        }
    }

    updateModelPosition() {
        this.model.position.copy(this.position);
        this.model.rotation.y = this.moveDirection > 0 ? Math.PI / 2 : -Math.PI / 2;
    }

    defeat(fromAbove = false) {
        if (this.defeated) return;

        this.defeated = true;
        this.active = false;

        if (fromAbove) {
            // Squash animation
            this.model.scale.y = 0.2;
            this.model.scale.x = 1.5;
            this.model.scale.z = 1.5;

            setTimeout(() => {
                this.remove();
            }, 500);
        } else {
            // Flip and fall
            this.velocity.y = 10;
            this.velocity.x = -this.moveDirection * 5;

            const flipInterval = setInterval(() => {
                this.model.rotation.z += 0.2;
            }, 50);

            setTimeout(() => {
                clearInterval(flipInterval);
                this.remove();
            }, 1000);
        }

        if (window.audioManager) window.audioManager.playSound('enemyDefeat');
    }

    remove() {
        this.scene.remove(this.model);
        this.physics.removeObject(this);
        this.active = false;
    }
}

class EnemyManager {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.enemies = [];
    }

    spawnEnemy(position, type = 'goomba') {
        const enemy = new Enemy(this.scene, this.physics, position, type);
        this.enemies.push(enemy);
        return enemy;
    }

    update(deltaTime, player) {
        // Update all enemies
        this.enemies.forEach(enemy => {
            if (enemy.active) {
                enemy.update(deltaTime);

                // Check collision with player
                if (Utils.boxIntersectsBox(player.boundingBox, enemy.boundingBox)) {
                    // Check if player is above enemy
                    if (player.velocity.y < 0 && player.position.y > enemy.position.y + 0.5) {
                        // Player jumped on enemy
                        enemy.defeat(true);
                        player.velocity.y = 10; // Bounce
                        player.score += 200;
                    } else {
                        // Enemy hit player
                        player.takeDamage();
                    }
                }
            }
        });

        // Remove inactive enemies
        this.enemies = this.enemies.filter(enemy => enemy.active || enemy.defeated);
    }

    clear() {
        this.enemies.forEach(enemy => enemy.remove());
        this.enemies = [];
    }
}
