// Player character with Mario-style movement

class Player {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;

        // Player stats
        this.lives = 3;
        this.coins = 0;
        this.score = 0;
        this.powerUpState = 'small'; // small, big, fire
        this.invincible = false;
        this.invincibilityTimer = 0;

        // Physics properties
        this.position = new THREE.Vector3(0, 5, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.size = new THREE.Vector3(1, 1.8, 1);
        this.boundingBox = new THREE.Box3();

        // Movement properties
        this.speed = 8;
        this.runSpeed = 14;
        this.jumpForce = 15;
        this.doubleJumpForce = 12;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.isGrounded = false;
        this.acceleration = 40;
        this.friction = 12;

        // Animation state
        this.animationState = 'idle'; // idle, walk, run, jump, fall
        this.facingAngle = 0;

        // Create 3D model
        this.createModel();

        // Add to physics
        this.physics.addObject(this);
    }

    createModel() {
        // Create Mario-style character
        this.model = new THREE.Group();

        // Body (red shirt)
        const bodyGeometry = new THREE.BoxGeometry(0.8, 0.9, 0.6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.45;
        this.model.add(body);

        // Head (skin color)
        const headGeometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.25;
        this.model.add(head);

        // Cap (red)
        const capGeometry = new THREE.BoxGeometry(0.75, 0.3, 0.75);
        const capMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.position.y = 1.55;
        this.model.add(cap);

        // Cap visor
        const visorGeometry = new THREE.BoxGeometry(0.75, 0.1, 0.4);
        const visor = new THREE.Mesh(visorGeometry, capMaterial);
        visor.position.set(0, 1.45, 0.4);
        this.model.add(visor);

        // Mustache (brown/black)
        const mustacheGeometry = new THREE.BoxGeometry(0.5, 0.15, 0.3);
        const mustacheMaterial = new THREE.MeshLambertMaterial({ color: 0x4a2511 });
        const mustache = new THREE.Mesh(mustacheGeometry, mustacheMaterial);
        mustache.position.set(0, 1.15, 0.4);
        this.model.add(mustache);

        // Overalls (blue)
        const overallsGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.6);
        const overallsMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });
        const overalls = new THREE.Mesh(overallsGeometry, overallsMaterial);
        overalls.position.y = 0.2;
        this.model.add(overalls);

        // Legs (blue)
        const legGeometry = new THREE.BoxGeometry(0.3, 0.7, 0.4);
        const leftLeg = new THREE.Mesh(legGeometry, overallsMaterial);
        leftLeg.position.set(-0.2, -0.35, 0);
        this.model.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, overallsMaterial);
        rightLeg.position.set(0.2, -0.35, 0);
        this.model.add(rightLeg);
        this.leftLeg = leftLeg;
        this.rightLeg = rightLeg;

        // Shoes (brown)
        const shoeGeometry = new THREE.BoxGeometry(0.35, 0.2, 0.6);
        const shoeMaterial = new THREE.MeshLambertMaterial({ color: 0x4a2511 });
        const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        leftShoe.position.set(-0.2, -0.75, 0.05);
        this.model.add(leftShoe);

        const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        rightShoe.position.set(0.2, -0.75, 0.05);
        this.model.add(rightShoe);

        // Arms
        const armGeometry = new THREE.BoxGeometry(0.25, 0.7, 0.25);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.55, 0.5, 0);
        this.model.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.55, 0.5, 0);
        this.model.add(rightArm);
        this.leftArm = leftArm;
        this.rightArm = rightArm;

        // Gloves (white)
        const gloveGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const gloveMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const leftGlove = new THREE.Mesh(gloveGeometry, gloveMaterial);
        leftGlove.position.set(-0.55, 0.15, 0);
        this.model.add(leftGlove);

        const rightGlove = new THREE.Mesh(gloveGeometry, gloveMaterial);
        rightGlove.position.set(0.55, 0.15, 0);
        this.model.add(rightGlove);

        // Add to scene
        this.scene.add(this.model);
        this.updateModelPosition();
    }

    update(deltaTime, input) {
        // Update invincibility
        if (this.invincible) {
            this.invincibilityTimer -= deltaTime;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
                this.model.children.forEach(child => {
                    child.visible = true;
                });
            } else {
                // Flashing effect
                const flash = Math.floor(this.invincibilityTimer * 10) % 2 === 0;
                this.model.children.forEach(child => {
                    child.visible = flash;
                });
            }
        }

        // Get movement input
        const movement = input.getMovementInput();

        // Calculate target velocity based on input
        const currentSpeed = movement.run ? this.runSpeed : this.speed;
        const targetVelocityX = movement.right * currentSpeed;
        const targetVelocityZ = -movement.forward * currentSpeed;

        // Apply acceleration/friction
        if (this.isGrounded) {
            this.velocity.x = Utils.lerp(this.velocity.x, targetVelocityX, this.acceleration * deltaTime);
            this.velocity.z = Utils.lerp(this.velocity.z, targetVelocityZ, this.acceleration * deltaTime);

            // Apply friction
            if (Math.abs(targetVelocityX) < 0.1) {
                this.velocity.x *= Math.pow(0.1, deltaTime * this.friction);
            }
            if (Math.abs(targetVelocityZ) < 0.1) {
                this.velocity.z *= Math.pow(0.1, deltaTime * this.friction);
            }
        } else {
            // Air control (reduced)
            this.velocity.x += (targetVelocityX - this.velocity.x) * deltaTime * 5;
            this.velocity.z += (targetVelocityZ - this.velocity.z) * deltaTime * 5;
        }

        // Jumping
        if (movement.jump && !this.lastJumpState) {
            if (this.isGrounded) {
                this.velocity.y = this.jumpForce;
                this.isGrounded = false;
                this.canDoubleJump = true;
                this.hasDoubleJumped = false;
                if (window.audioManager) window.audioManager.playSound('jump');
            } else if (this.canDoubleJump && !this.hasDoubleJumped) {
                this.velocity.y = this.doubleJumpForce;
                this.hasDoubleJumped = true;
                if (window.audioManager) window.audioManager.playSound('doubleJump');
            }
        }
        this.lastJumpState = movement.jump;

        // Apply gravity
        this.velocity.y += this.physics.gravity * deltaTime;

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // Update bounding box
        Utils.updateBoundingBox(this.boundingBox, this.position, this.size);

        // Check collisions
        const collision = this.physics.resolveCollision(this.position, this.size, this.velocity);
        if (collision === 'ground') {
            this.isGrounded = true;
            this.canDoubleJump = false;
            this.hasDoubleJumped = false;
        } else {
            // Check if still grounded with raycast
            const groundCheck = this.physics.raycastDown(this.position, 0.1);
            this.isGrounded = groundCheck !== null;
        }

        // Update bounding box after collision resolution
        Utils.updateBoundingBox(this.boundingBox, this.position, this.size);

        // Update facing direction
        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.z) > 0.1) {
            this.facingAngle = Math.atan2(this.velocity.x, this.velocity.z);
        }

        // Update animation state
        this.updateAnimation(movement);

        // Update model position and rotation
        this.updateModelPosition();

        // Death check
        if (this.position.y < -20) {
            this.die();
        }
    }

    updateAnimation(movement) {
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);

        if (!this.isGrounded) {
            this.animationState = this.velocity.y > 0 ? 'jump' : 'fall';
        } else if (speed > 0.5) {
            this.animationState = movement.run ? 'run' : 'walk';
        } else {
            this.animationState = 'idle';
        }

        // Simple walking animation
        const time = Date.now() * 0.01;
        if (this.animationState === 'walk' || this.animationState === 'run') {
            const speedMultiplier = this.animationState === 'run' ? 1.5 : 1;
            this.leftLeg.rotation.x = Math.sin(time * speedMultiplier) * 0.5;
            this.rightLeg.rotation.x = -Math.sin(time * speedMultiplier) * 0.5;
            this.leftArm.rotation.x = -Math.sin(time * speedMultiplier) * 0.3;
            this.rightArm.rotation.x = Math.sin(time * speedMultiplier) * 0.3;
        } else {
            this.leftLeg.rotation.x = 0;
            this.rightLeg.rotation.x = 0;
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;
        }
    }

    updateModelPosition() {
        this.model.position.copy(this.position);
        this.model.rotation.y = this.facingAngle;
    }

    collectCoin() {
        this.coins++;
        this.score += 100;
        if (this.coins >= 100) {
            this.coins -= 100;
            this.addLife();
        }
        if (window.audioManager) window.audioManager.playSound('coin');
    }

    collectStar() {
        this.score += 1000;
        if (window.audioManager) window.audioManager.playSound('star');
    }

    powerUp() {
        if (this.powerUpState === 'small') {
            this.powerUpState = 'big';
            this.size.y = 2.2;
            this.score += 1000;
        } else if (this.powerUpState === 'big') {
            this.powerUpState = 'fire';
            this.score += 1000;
        }
        if (window.audioManager) window.audioManager.playSound('powerUp');
    }

    takeDamage() {
        if (this.invincible) return;

        if (this.powerUpState === 'fire') {
            this.powerUpState = 'big';
        } else if (this.powerUpState === 'big') {
            this.powerUpState = 'small';
            this.size.y = 1.8;
        } else {
            this.die();
            return;
        }

        this.invincible = true;
        this.invincibilityTimer = 2.0;
        if (window.audioManager) window.audioManager.playSound('damage');
    }

    die() {
        this.lives--;
        this.position.set(0, 5, 0);
        this.velocity.set(0, 0, 0);
        this.powerUpState = 'small';
        this.size.y = 1.8;
        if (window.audioManager) window.audioManager.playSound('damage');
    }

    addLife() {
        this.lives++;
        if (window.audioManager) window.audioManager.playSound('oneUp');
    }

    reset() {
        this.position.set(0, 5, 0);
        this.velocity.set(0, 0, 0);
        this.lives = 3;
        this.coins = 0;
        this.score = 0;
        this.powerUpState = 'small';
        this.size.y = 1.8;
        this.invincible = false;
    }
}
