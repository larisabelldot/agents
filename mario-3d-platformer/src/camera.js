// Camera controller for 3rd person follow

class CameraController {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;

        // Camera settings
        this.distance = 12;
        this.height = 6;
        this.rotationSpeed = 0.002;
        this.smoothing = 0.1;

        // Camera rotation
        this.azimuth = Math.PI; // Horizontal rotation
        this.elevation = 0.4; // Vertical rotation
        this.minElevation = 0.1;
        this.maxElevation = Math.PI / 2 - 0.1;

        // Target position
        this.targetPosition = new THREE.Vector3();
        this.currentPosition = new THREE.Vector3();
        this.lookAtPosition = new THREE.Vector3();

        // Sensitivity
        this.sensitivity = 1.0;
    }

    update(deltaTime, mouseDelta) {
        // Update rotation based on mouse movement
        if (mouseDelta) {
            this.azimuth -= mouseDelta.x * this.rotationSpeed * this.sensitivity;
            this.elevation -= mouseDelta.y * this.rotationSpeed * this.sensitivity;

            // Clamp elevation
            this.elevation = Utils.clamp(this.elevation, this.minElevation, this.maxElevation);
        }

        // Calculate camera position relative to player
        const horizontalDist = this.distance * Math.cos(this.elevation);
        const verticalDist = this.distance * Math.sin(this.elevation);

        this.targetPosition.set(
            this.player.position.x + horizontalDist * Math.sin(this.azimuth),
            this.player.position.y + verticalDist + this.height,
            this.player.position.z + horizontalDist * Math.cos(this.azimuth)
        );

        // Smooth camera movement
        this.currentPosition.lerp(this.targetPosition, this.smoothing);

        // Update camera position
        this.camera.position.copy(this.currentPosition);

        // Look at player (slightly above center)
        this.lookAtPosition.copy(this.player.position);
        this.lookAtPosition.y += 2;
        this.camera.lookAt(this.lookAtPosition);
    }

    setSensitivity(value) {
        this.sensitivity = value / 5; // Normalize to reasonable range
    }

    reset() {
        this.azimuth = Math.PI;
        this.elevation = 0.4;
    }

    getForwardDirection() {
        // Get forward direction in world space (useful for movement)
        const forward = new THREE.Vector3();
        forward.set(
            -Math.sin(this.azimuth),
            0,
            -Math.cos(this.azimuth)
        );
        return forward;
    }

    getRightDirection() {
        // Get right direction in world space
        const right = new THREE.Vector3();
        right.set(
            Math.cos(this.azimuth),
            0,
            -Math.sin(this.azimuth)
        );
        return right;
    }
}
