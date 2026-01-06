// Particle effects system

class Particle {
    constructor(scene, position, velocity, color, lifetime = 1.0, size = 0.2) {
        this.scene = scene;
        this.position = position.clone();
        this.velocity = velocity.clone();
        this.color = color;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.size = size;
        this.active = true;

        this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.size, 6, 6);
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    update(deltaTime, gravity = -20) {
        this.lifetime -= deltaTime;

        if (this.lifetime <= 0) {
            this.remove();
            return;
        }

        // Apply velocity and gravity
        this.velocity.y += gravity * deltaTime;
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

        // Update mesh
        this.mesh.position.copy(this.position);

        // Fade out
        const alpha = this.lifetime / this.maxLifetime;
        this.mesh.material.opacity = alpha;
        this.mesh.scale.setScalar(alpha);
    }

    remove() {
        this.active = false;
        this.scene.remove(this.mesh);
    }
}

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }

    emit(position, count, color, velocityRange = 5, lifetime = 1.0, size = 0.2) {
        for (let i = 0; i < count; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * velocityRange,
                Math.random() * velocityRange,
                (Math.random() - 0.5) * velocityRange
            );

            const particle = new Particle(
                this.scene,
                position,
                velocity,
                color,
                lifetime,
                size
            );

            this.particles.push(particle);
        }
    }

    emitCoinEffect(position) {
        this.emit(position, 8, 0xffcc00, 4, 0.8, 0.15);
    }

    emitStarEffect(position) {
        this.emit(position, 15, 0xffff00, 6, 1.2, 0.2);
    }

    emitPowerUpEffect(position) {
        this.emit(position, 12, 0xff00ff, 5, 1.0, 0.18);
    }

    emitDefeatEffect(position) {
        this.emit(position, 10, 0x888888, 4, 0.6, 0.15);
    }

    emitJumpDust(position) {
        this.emit(position, 5, 0xcccccc, 2, 0.4, 0.1);
    }

    emitExplosion(position, color = 0xff6600) {
        this.emit(position, 20, color, 8, 1.5, 0.25);
    }

    emitTrail(position, color, count = 3) {
        for (let i = 0; i < count; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 1
            );

            const particle = new Particle(
                this.scene,
                position,
                velocity,
                color,
                0.3,
                0.1
            );

            this.particles.push(particle);
        }
    }

    update(deltaTime) {
        this.particles.forEach(particle => {
            if (particle.active) {
                particle.update(deltaTime);
            }
        });

        // Remove inactive particles
        this.particles = this.particles.filter(p => p.active);
    }

    clear() {
        this.particles.forEach(p => p.remove());
        this.particles = [];
    }
}
