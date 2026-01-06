// Collectibles system (coins, stars, etc.)

class Collectible {
    constructor(scene, position, type = 'coin') {
        this.scene = scene;
        this.type = type;
        this.position = position.clone();
        this.collected = false;
        this.active = true;

        // Bounding box for collision
        this.size = new THREE.Vector3(0.8, 0.8, 0.8);
        this.boundingBox = new THREE.Box3();
        Utils.updateBoundingBox(this.boundingBox, this.position, this.size);

        // Animation
        this.rotationSpeed = 2;
        this.bobSpeed = 2;
        this.bobHeight = 0.3;
        this.startY = position.y;

        this.createModel();
    }

    createModel() {
        this.model = new THREE.Group();

        if (this.type === 'coin') {
            // Coin (spinning disc)
            const coinGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
            const coinMaterial = new THREE.MeshLambertMaterial({
                color: 0xffcc00,
                emissive: 0xffaa00,
                emissiveIntensity: 0.3
            });
            const coin = new THREE.Mesh(coinGeometry, coinMaterial);
            coin.rotation.x = Math.PI / 2;
            this.model.add(coin);

            // Add shine effect
            const shineGeometry = new THREE.CircleGeometry(0.3, 8);
            const shineMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff99,
                transparent: true,
                opacity: 0.7
            });
            const shine = new THREE.Mesh(shineGeometry, shineMaterial);
            shine.position.z = 0.06;
            this.model.add(shine);

        } else if (this.type === 'star') {
            // Star collectible
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
                depth: 0.2,
                bevelEnabled: true,
                bevelThickness: 0.05,
                bevelSize: 0.05,
                bevelSegments: 3
            };

            const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
            const starMaterial = new THREE.MeshLambertMaterial({
                color: 0xffff00,
                emissive: 0xffdd00,
                emissiveIntensity: 0.5
            });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.z = -0.1;
            this.model.add(star);

            this.size.set(1.2, 1.2, 1.2);
        }

        this.model.position.copy(this.position);
        this.scene.add(this.model);
    }

    update(deltaTime) {
        if (!this.active) return;

        // Rotate
        this.model.rotation.y += this.rotationSpeed * deltaTime;

        // Bob up and down
        const time = Date.now() * 0.001;
        this.position.y = this.startY + Math.sin(time * this.bobSpeed) * this.bobHeight;
        this.model.position.copy(this.position);

        // Update bounding box
        Utils.updateBoundingBox(this.boundingBox, this.position, this.size);
    }

    collect() {
        if (this.collected) return;

        this.collected = true;
        this.active = false;

        // Collection animation
        const startScale = this.model.scale.clone();
        const duration = 300;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Scale up and fade out
            const scale = 1 + progress * 0.5;
            this.model.scale.set(scale, scale, scale);
            this.model.position.y += deltaTime * 2;

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
        this.active = false;
    }
}

class CollectibleManager {
    constructor(scene) {
        this.scene = scene;
        this.collectibles = [];
    }

    spawnCoin(position) {
        const coin = new Collectible(this.scene, position, 'coin');
        this.collectibles.push(coin);
        return coin;
    }

    spawnStar(position) {
        const star = new Collectible(this.scene, position, 'star');
        this.collectibles.push(star);
        return star;
    }

    update(deltaTime, player) {
        this.collectibles.forEach(collectible => {
            if (collectible.active) {
                collectible.update(deltaTime);

                // Check collision with player
                if (Utils.boxIntersectsBox(player.boundingBox, collectible.boundingBox)) {
                    if (collectible.type === 'coin') {
                        player.collectCoin();
                        collectible.collect();
                    } else if (collectible.type === 'star') {
                        player.collectStar();
                        collectible.collect();
                    }
                }
            }
        });

        // Remove collected items
        this.collectibles = this.collectibles.filter(c => c.active || !c.collected);
    }

    clear() {
        this.collectibles.forEach(c => c.remove());
        this.collectibles = [];
    }

    getActiveStars() {
        return this.collectibles.filter(c => c.type === 'star' && c.active).length;
    }

    getTotalStars() {
        return this.collectibles.filter(c => c.type === 'star').length;
    }
}
