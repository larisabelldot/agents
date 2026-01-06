// Physics system for platformer mechanics

class PhysicsWorld {
    constructor() {
        this.gravity = -30; // Gravity acceleration
        this.objects = [];
        this.staticObjects = [];
    }

    addObject(object) {
        this.objects.push(object);
    }

    addStaticObject(object) {
        this.staticObjects.push(object);
    }

    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    update(deltaTime) {
        // Update all physics objects
        this.objects.forEach(obj => {
            if (obj.update) {
                obj.update(deltaTime);
            }
        });

        // Check collisions
        this.checkCollisions();
    }

    checkCollisions() {
        // Check each dynamic object against static objects
        this.objects.forEach(obj => {
            if (!obj.boundingBox) return;

            this.staticObjects.forEach(staticObj => {
                if (!staticObj.boundingBox) return;

                if (Utils.boxIntersectsBox(obj.boundingBox, staticObj.boundingBox)) {
                    if (obj.onCollision) {
                        obj.onCollision(staticObj);
                    }
                }
            });

            // Check against other dynamic objects
            this.objects.forEach(otherObj => {
                if (obj === otherObj || !otherObj.boundingBox) return;

                if (Utils.boxIntersectsBox(obj.boundingBox, otherObj.boundingBox)) {
                    if (obj.onCollision) {
                        obj.onCollision(otherObj);
                    }
                }
            });
        });
    }

    // Raycast to check ground collision
    raycastDown(position, maxDistance = 1) {
        const rayStart = position.clone();
        const rayEnd = rayStart.clone();
        rayEnd.y -= maxDistance;

        let closestHit = null;
        let closestDistance = maxDistance;

        this.staticObjects.forEach(obj => {
            if (!obj.boundingBox) return;

            // Simple AABB raycast
            if (rayStart.x >= obj.boundingBox.min.x && rayStart.x <= obj.boundingBox.max.x &&
                rayStart.z >= obj.boundingBox.min.z && rayStart.z <= obj.boundingBox.max.z) {

                if (rayStart.y > obj.boundingBox.max.y && rayEnd.y <= obj.boundingBox.max.y) {
                    const distance = rayStart.y - obj.boundingBox.max.y;
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestHit = {
                            object: obj,
                            distance: distance,
                            point: new THREE.Vector3(rayStart.x, obj.boundingBox.max.y, rayStart.z)
                        };
                    }
                }
            }
        });

        return closestHit;
    }

    // Check if position is inside any static object
    checkPosition(position, size) {
        const testBox = new THREE.Box3(
            new THREE.Vector3(position.x - size.x / 2, position.y - size.y / 2, position.z - size.z / 2),
            new THREE.Vector3(position.x + size.x / 2, position.y + size.y / 2, position.z + size.z / 2)
        );

        for (let obj of this.staticObjects) {
            if (obj.boundingBox && Utils.boxIntersectsBox(testBox, obj.boundingBox)) {
                return obj;
            }
        }

        return null;
    }

    // Resolve collision by moving object out of static object
    resolveCollision(position, size, velocity) {
        const testBox = new THREE.Box3();
        Utils.updateBoundingBox(testBox, position, size);

        for (let obj of this.staticObjects) {
            if (!obj.boundingBox) continue;

            if (Utils.boxIntersectsBox(testBox, obj.boundingBox)) {
                // Calculate overlap on each axis
                const overlapX = Math.min(
                    testBox.max.x - obj.boundingBox.min.x,
                    obj.boundingBox.max.x - testBox.min.x
                );
                const overlapY = Math.min(
                    testBox.max.y - obj.boundingBox.min.y,
                    obj.boundingBox.max.y - testBox.min.y
                );
                const overlapZ = Math.min(
                    testBox.max.z - obj.boundingBox.min.z,
                    obj.boundingBox.max.z - testBox.min.z
                );

                // Resolve on smallest overlap axis
                if (overlapY < overlapX && overlapY < overlapZ) {
                    // Vertical collision
                    if (velocity.y < 0) {
                        position.y = obj.boundingBox.max.y + size.y / 2;
                        velocity.y = 0;
                        return 'ground';
                    } else {
                        position.y = obj.boundingBox.min.y - size.y / 2;
                        velocity.y = 0;
                        return 'ceiling';
                    }
                } else if (overlapX < overlapZ) {
                    // X-axis collision
                    if (position.x < obj.boundingBox.min.x) {
                        position.x = obj.boundingBox.min.x - size.x / 2;
                    } else {
                        position.x = obj.boundingBox.max.x + size.x / 2;
                    }
                    velocity.x *= 0.5;
                    return 'wall';
                } else {
                    // Z-axis collision
                    if (position.z < obj.boundingBox.min.z) {
                        position.z = obj.boundingBox.min.z - size.z / 2;
                    } else {
                        position.z = obj.boundingBox.max.z + size.z / 2;
                    }
                    velocity.z *= 0.5;
                    return 'wall';
                }
            }
        }

        return null;
    }

    clear() {
        this.objects = [];
        this.staticObjects = [];
    }
}
