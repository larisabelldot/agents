// Utility functions for the game

const Utils = {
    // Linear interpolation
    lerp: (start, end, t) => {
        return start + (end - start) * t;
    },

    // Clamp value between min and max
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },

    // Check if point is inside box (AABB collision)
    pointInBox: (point, box) => {
        return (
            point.x >= box.min.x && point.x <= box.max.x &&
            point.y >= box.min.y && point.y <= box.max.y &&
            point.z >= box.min.z && point.z <= box.max.z
        );
    },

    // AABB collision detection
    boxIntersectsBox: (box1, box2) => {
        return (
            box1.min.x <= box2.max.x && box1.max.x >= box2.min.x &&
            box1.min.y <= box2.max.y && box1.max.y >= box2.min.y &&
            box1.min.z <= box2.max.z && box1.max.z >= box2.min.z
        );
    },

    // Distance between two points
    distance: (p1, p2) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },

    // Random number between min and max
    random: (min, max) => {
        return Math.random() * (max - min) + min;
    },

    // Random integer between min and max (inclusive)
    randomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Get random element from array
    randomElement: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Format time (seconds to MM:SS)
    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // Create bounding box from object
    createBoundingBox: (object) => {
        const box = new THREE.Box3();
        box.setFromObject(object);
        return box;
    },

    // Update bounding box position
    updateBoundingBox: (box, position, size) => {
        box.min.set(
            position.x - size.x / 2,
            position.y - size.y / 2,
            position.z - size.z / 2
        );
        box.max.set(
            position.x + size.x / 2,
            position.y + size.y / 2,
            position.z + size.z / 2
        );
    }
};
