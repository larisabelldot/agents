// Level system with platforms and world geometry

class Level {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.platforms = [];
        this.decorations = [];
    }

    createPlatform(position, size, color = 0x00ff00) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshLambertMaterial({ color: color });
        const platform = new THREE.Mesh(geometry, material);

        platform.position.copy(position);
        platform.castShadow = true;
        platform.receiveShadow = true;

        // Add bounding box for collision
        platform.boundingBox = new THREE.Box3();
        platform.boundingBox.setFromObject(platform);

        this.scene.add(platform);
        this.physics.addStaticObject(platform);
        this.platforms.push(platform);

        return platform;
    }

    createTexturedPlatform(position, size, topColor = 0x00aa00, sideColor = 0x8b4513) {
        const group = new THREE.Group();

        // Top (grass)
        const topGeometry = new THREE.BoxGeometry(size.x, 0.1, size.z);
        const topMaterial = new THREE.MeshLambertMaterial({ color: topColor });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = size.y / 2;
        group.add(top);

        // Sides (dirt)
        const sideGeometry = new THREE.BoxGeometry(size.x, size.y - 0.1, size.z);
        const sideMaterial = new THREE.MeshLambertMaterial({ color: sideColor });
        const sides = new THREE.Mesh(sideGeometry, sideMaterial);
        sides.position.y = -0.05;
        group.add(sides);

        group.position.copy(position);
        group.castShadow = true;
        group.receiveShadow = true;

        // Add bounding box
        group.boundingBox = new THREE.Box3();
        group.boundingBox.setFromObject(group);

        this.scene.add(group);
        this.physics.addStaticObject(group);
        this.platforms.push(group);

        return group;
    }

    createPipe(position, height = 3, color = 0x00ff00) {
        const group = new THREE.Group();

        // Pipe body
        const bodyGeometry = new THREE.CylinderGeometry(0.7, 0.7, height, 12);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = height / 2;
        group.add(body);

        // Pipe rim
        const rimGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.3, 12);
        const rimMaterial = new THREE.MeshLambertMaterial({ color: color });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.y = height;
        group.add(rim);

        group.position.copy(position);
        group.castShadow = true;
        group.receiveShadow = true;

        // Add bounding box
        group.boundingBox = new THREE.Box3();
        group.boundingBox.setFromObject(group);

        this.scene.add(group);
        this.physics.addStaticObject(group);
        this.decorations.push(group);

        return group;
    }

    createQuestionBlock(position, color = 0xffcc00) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({
            color: color,
            emissive: 0xaa8800,
            emissiveIntensity: 0.2
        });
        const block = new THREE.Mesh(geometry, material);

        block.position.copy(position);
        block.castShadow = true;
        block.receiveShadow = true;

        // Add question mark
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const markMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const markGeometry = new THREE.PlaneGeometry(0.6, 0.6);

        // Add marks on all sides
        const positions = [
            [0, 0, 0.51], [0, 0, -0.51],
            [0.51, 0, 0], [-0.51, 0, 0]
        ];
        const rotations = [
            [0, 0, 0], [0, Math.PI, 0],
            [0, Math.PI / 2, 0], [0, -Math.PI / 2, 0]
        ];

        positions.forEach((pos, i) => {
            const mark = new THREE.Mesh(markGeometry, markMaterial);
            mark.position.set(...pos);
            mark.rotation.set(...rotations[i]);
            block.add(mark);
        });

        // Add bounding box
        block.boundingBox = new THREE.Box3();
        block.boundingBox.setFromObject(block);
        block.isQuestionBlock = true;
        block.used = false;

        this.scene.add(block);
        this.physics.addStaticObject(block);
        this.platforms.push(block);

        return block;
    }

    createBrick(position, color = 0xcc6600) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({ color: color });
        const brick = new THREE.Mesh(geometry, material);

        brick.position.copy(position);
        brick.castShadow = true;
        brick.receiveShadow = true;

        // Add brick pattern
        const lineGeometry = new THREE.BoxGeometry(1.01, 0.02, 1.01);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });

        const hLine = new THREE.Mesh(lineGeometry, lineMaterial);
        brick.add(hLine);

        const vLine = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.01, 1.01), lineMaterial);
        vLine.position.x = -0.25;
        brick.add(vLine);

        // Add bounding box
        brick.boundingBox = new THREE.Box3();
        brick.boundingBox.setFromObject(brick);
        brick.isBrick = true;

        this.scene.add(brick);
        this.physics.addStaticObject(brick);
        this.platforms.push(brick);

        return brick;
    }

    buildLevel1() {
        // Ground
        this.createTexturedPlatform(
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(100, 2, 30)
        );

        // Starting area platforms
        this.createTexturedPlatform(
            new THREE.Vector3(8, 2, 5),
            new THREE.Vector3(4, 0.5, 4)
        );

        this.createTexturedPlatform(
            new THREE.Vector3(15, 4, 5),
            new THREE.Vector3(4, 0.5, 4)
        );

        this.createTexturedPlatform(
            new THREE.Vector3(22, 6, 5),
            new THREE.Vector3(4, 0.5, 4)
        );

        // Question blocks
        this.createQuestionBlock(new THREE.Vector3(10, 5, 5));
        this.createQuestionBlock(new THREE.Vector3(17, 7, 5));
        this.createQuestionBlock(new THREE.Vector3(24, 9, 5));

        // Bricks
        this.createBrick(new THREE.Vector3(11, 5, 5));
        this.createBrick(new THREE.Vector3(12, 5, 5));
        this.createBrick(new THREE.Vector3(18, 7, 5));
        this.createBrick(new THREE.Vector3(19, 7, 5));

        // Pipes
        this.createPipe(new THREE.Vector3(30, 0, 5), 3);
        this.createPipe(new THREE.Vector3(40, 0, 5), 4);
        this.createPipe(new THREE.Vector3(50, 0, 5), 5);

        // Floating platforms area
        this.createTexturedPlatform(
            new THREE.Vector3(35, 8, 0),
            new THREE.Vector3(5, 0.5, 5)
        );

        this.createTexturedPlatform(
            new THREE.Vector3(35, 8, 10),
            new THREE.Vector3(5, 0.5, 5)
        );

        this.createTexturedPlatform(
            new THREE.Vector3(45, 12, 5),
            new THREE.Vector3(6, 0.5, 6)
        );

        // High platform with star
        this.createTexturedPlatform(
            new THREE.Vector3(60, 15, 5),
            new THREE.Vector3(8, 0.5, 8)
        );

        // End area
        this.createTexturedPlatform(
            new THREE.Vector3(75, 3, 5),
            new THREE.Vector3(15, 0.5, 10)
        );

        // Castle/Goal platform
        this.createTexturedPlatform(
            new THREE.Vector3(85, 0, 5),
            new THREE.Vector3(10, 3, 10),
            0xaaaaaa,
            0x888888
        );

        // Add some decorative blocks
        for (let i = 0; i < 5; i++) {
            this.createBrick(new THREE.Vector3(5 + i, 8, -5));
        }

        // Walls to keep player in bounds
        this.createPlatform(
            new THREE.Vector3(-5, 5, 0),
            new THREE.Vector3(1, 20, 50),
            0x8b4513
        );

        this.createPlatform(
            new THREE.Vector3(95, 5, 0),
            new THREE.Vector3(1, 20, 50),
            0x8b4513
        );

        this.createPlatform(
            new THREE.Vector3(50, 5, -16),
            new THREE.Vector3(100, 20, 1),
            0x8b4513
        );

        this.createPlatform(
            new THREE.Vector3(50, 5, 16),
            new THREE.Vector3(100, 20, 1),
            0x8b4513
        );
    }

    clear() {
        this.platforms.forEach(platform => {
            this.scene.remove(platform);
            this.physics.staticObjects = this.physics.staticObjects.filter(obj => obj !== platform);
        });

        this.decorations.forEach(decoration => {
            this.scene.remove(decoration);
        });

        this.platforms = [];
        this.decorations = [];
    }
}
