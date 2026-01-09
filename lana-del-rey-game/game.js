// ============================================
// Lana Del Rey Song Guessing Game
// ============================================

// Song Database
const songDatabase = [
    {
        title: "Video Games",
        hints: {
            easy: "It's you, it's you, it's all for you, everything I do",
            medium: "Tell me I'm your national anthem",
            hard: "Swinging in the backyard"
        },
        album: "Born to Die"
    },
    {
        title: "Summertime Sadness",
        hints: {
            easy: "Kiss me hard before you go, summertime sadness",
            medium: "I got my red dress on tonight",
            hard: "Dancing till we die"
        },
        album: "Born to Die"
    },
    {
        title: "Born to Die",
        hints: {
            easy: "Feet don't fail me now, take me to the finish line",
            medium: "Choose your last words, this is the last time",
            hard: "Walk me down the aisle"
        },
        album: "Born to Die"
    },
    {
        title: "Blue Jeans",
        hints: {
            easy: "Blue jeans, white shirt, walked into the room",
            medium: "I will love you till the end of time",
            hard: "Big dreams, gangster"
        },
        album: "Born to Die"
    },
    {
        title: "Young and Beautiful",
        hints: {
            easy: "Will you still love me when I'm no longer young and beautiful",
            medium: "Hot summer nights, mid-July",
            hard: "Dear Lord, when I get to heaven"
        },
        album: "The Great Gatsby"
    },
    {
        title: "Ultraviolence",
        hints: {
            easy: "He hit me and it felt like a kiss",
            medium: "I can hear sirens, sirens",
            hard: "Jim raised me up"
        },
        album: "Ultraviolence"
    },
    {
        title: "West Coast",
        hints: {
            easy: "Down on the West Coast, they got a saying",
            medium: "You got the music in you",
            hard: "I can see my baby swinging"
        },
        album: "Ultraviolence"
    },
    {
        title: "Shades of Cool",
        hints: {
            easy: "My baby lives in shades of blue",
            medium: "But he don't love me, yes I know now",
            hard: "Soft to the touch"
        },
        album: "Ultraviolence"
    },
    {
        title: "Brooklyn Baby",
        hints: {
            easy: "Well, my boyfriend's in a band",
            medium: "They say I'm too young to love you",
            hard: "Lou Reed is my favorite"
        },
        album: "Ultraviolence"
    },
    {
        title: "Love",
        hints: {
            easy: "Look at you kids with your vintage music",
            medium: "You were mine, all mine",
            hard: "Running through the garden"
        },
        album: "Lust for Life"
    },
    {
        title: "Lust for Life",
        hints: {
            easy: "Take off, take off all your clothes",
            medium: "A lust for life keeps us alive",
            hard: "Climbing up the H of the Hollywood sign"
        },
        album: "Lust for Life"
    },
    {
        title: "Cherry",
        hints: {
            easy: "I fall to pieces when I'm with you",
            medium: "Love you till the end of time",
            hard: "Babe, don't you break me"
        },
        album: "Lust for Life"
    },
    {
        title: "Mariners Apartment Complex",
        hints: {
            easy: "You took my sadness out of context",
            medium: "I'm your man",
            hard: "Catch a wave and take in the sweetness"
        },
        album: "Norman Fucking Rockwell!"
    },
    {
        title: "Venice Bitch",
        hints: {
            easy: "Fear fun, fear love, fresh out of fucks",
            medium: "Back in the garden, we're getting high now",
            hard: "Bang bang, kiss kiss"
        },
        album: "Norman Fucking Rockwell!"
    },
    {
        title: "hope is a dangerous thing",
        hints: {
            easy: "Hope is a dangerous thing for a woman like me to have",
            medium: "I've been tearing around in my fucking nightgown",
            hard: "Twenty-four seven, three sixty-five"
        },
        album: "Norman Fucking Rockwell!"
    },
    {
        title: "The Greatest",
        hints: {
            easy: "The culture is lit and if this is it, I had a ball",
            medium: "Long Beach, New York, Kanye West",
            hard: "LA is in flames, it's getting hot"
        },
        album: "Norman Fucking Rockwell!"
    },
    {
        title: "White Dress",
        hints: {
            easy: "When I was nineteen, waitressing at the Denny's",
            medium: "I felt free, listened to rock and roll",
            hard: "It was beautiful, so simple"
        },
        album: "Chemtrails over the Country Club"
    },
    {
        title: "Chemtrails over the Country Club",
        hints: {
            easy: "I'm on the run with you, my sweet love",
            medium: "Nobody's son, nobody's daughter",
            hard: "White picket, chemtrails"
        },
        album: "Chemtrails over the Country Club"
    },
    {
        title: "Dark But Just a Game",
        hints: {
            easy: "It's dark, but just a game",
            medium: "Life is sweet or whatever, baby",
            hard: "You name it, we did it"
        },
        album: "Chemtrails over the Country Club"
    },
    {
        title: "Wildflower Wildfire",
        hints: {
            easy: "Hot July and August nights, those summer feelings",
            medium: "You're California beautiful",
            hard: "Wildflower, wildfire"
        },
        album: "Blue Banisters"
    },
    {
        title: "Blue Banisters",
        hints: {
            easy: "She said, 'You don't know what pain is'",
            medium: "Jenny and Nikki and Josie and Joni",
            hard: "Said my architect"
        },
        album: "Blue Banisters"
    },
    {
        title: "Arcadia",
        hints: {
            easy: "My body is a map of LA",
            medium: "I love to love, to love to love you",
            hard: "My rose garden dreams"
        },
        album: "Blue Banisters"
    },
    {
        title: "A&W",
        hints: {
            easy: "Jimmy only love me when he wanna get high",
            medium: "American whore, I do it for free",
            hard: "Good men don't exist"
        },
        album: "Did you know that there's a tunnel under Ocean Blvd"
    },
    {
        title: "The Grants",
        hints: {
            easy: "I changed my name to be with you",
            medium: "There's a tunnel under Ocean Boulevard",
            hard: "Alabama, Arkansas"
        },
        album: "Did you know that there's a tunnel under Ocean Blvd"
    },
    {
        title: "Did you know that there's a tunnel under Ocean Blvd",
        hints: {
            easy: "Don't forget me like the tunnel under Ocean Boulevard",
            medium: "When's it gonna be my turn",
            hard: "Don't forget me"
        },
        album: "Did you know that there's a tunnel under Ocean Blvd"
    },
    {
        title: "National Anthem",
        hints: {
            easy: "Money is the anthem of success",
            medium: "Red, white, blue is in the sky",
            hard: "Tell me I'm your national anthem"
        },
        album: "Born to Die"
    },
    {
        title: "Ride",
        hints: {
            easy: "I was a singer, not a very popular one",
            medium: "I've been out on the open road",
            hard: "Who are you?"
        },
        album: "Paradise"
    },
    {
        title: "Cola",
        hints: {
            easy: "My pussy tastes like Pepsi Cola",
            medium: "Harvey's in the sky with diamonds",
            hard: "I got a taste for men"
        },
        album: "Paradise"
    },
    {
        title: "Gods & Monsters",
        hints: {
            easy: "Living like Jim Morrison",
            medium: "In the land of gods and monsters",
            hard: "I was an angel"
        },
        album: "Paradise"
    },
    {
        title: "Carmen",
        hints: {
            easy: "Darling, darling, doesn't have a problem",
            medium: "She laughs like God",
            hard: "Baby's all dressed up"
        },
        album: "Born to Die"
    }
];

// Game State
let gameState = {
    difficulty: null,
    currentQuestion: 0,
    totalQuestions: 10,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctAnswers: 0,
    skipsRemaining: 3,
    hintsRemaining: 2,
    timer: null,
    timeLeft: 30,
    currentSongs: [],
    usedSongs: []
};

// Three.js Scene Variables
let scene, camera, renderer, particles, roses, vinyls;
let animationId;

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initEventListeners();

    // Simulate loading
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('game-container').classList.remove('hidden');
        }, 500);
    }, 2000);
});

// ============================================
// Three.js 3D Scene
// ============================================

function initThreeJS() {
    const canvas = document.getElementById('three-canvas');

    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 15;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xD4AF37, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8B2635, 0.8, 100);
    pointLight2.position.set(-10, -10, 5);
    scene.add(pointLight2);

    // Create particles (stars/sparkles)
    createParticles();

    // Create floating vinyl records
    createVinyls();

    // Create floating roses
    createRoses();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation
    animate();
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xD4AF37,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

function createVinyls() {
    vinyls = [];
    const vinylGeometry = new THREE.TorusGeometry(1, 0.4, 16, 32);
    const vinylMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a,
        shininess: 100,
        transparent: true,
        opacity: 0.6
    });

    for (let i = 0; i < 3; i++) {
        const vinyl = new THREE.Mesh(vinylGeometry, vinylMaterial);
        vinyl.position.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10
        );
        vinyl.rotation.x = Math.random() * Math.PI;
        vinyl.userData.rotationSpeed = 0.001 + Math.random() * 0.002;
        vinyls.push(vinyl);
        scene.add(vinyl);
    }
}

function createRoses() {
    roses = [];
    const roseGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const roseMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B2635,
        shininess: 50,
        transparent: true,
        opacity: 0.7
    });

    for (let i = 0; i < 5; i++) {
        const rose = new THREE.Mesh(roseGeometry, roseMaterial);
        rose.position.set(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 15
        );
        rose.userData.floatSpeed = 0.0005 + Math.random() * 0.001;
        rose.userData.floatOffset = Math.random() * Math.PI * 2;
        roses.push(rose);
        scene.add(rose);
    }
}

function animate() {
    animationId = requestAnimationFrame(animate);

    // Rotate particles
    if (particles) {
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0003;
    }

    // Animate vinyls
    vinyls.forEach(vinyl => {
        vinyl.rotation.z += vinyl.userData.rotationSpeed;
        vinyl.position.y += Math.sin(Date.now() * 0.001) * 0.01;
    });

    // Animate roses
    roses.forEach(rose => {
        rose.position.y += Math.sin(Date.now() * rose.userData.floatSpeed + rose.userData.floatOffset) * 0.01;
        rose.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// Event Listeners
// ============================================

function initEventListeners() {
    // Difficulty selection
    document.querySelectorAll('.btn-difficulty').forEach(btn => {
        btn.addEventListener('click', () => {
            gameState.difficulty = btn.dataset.difficulty;
            startGame();
        });
    });

    // Power-ups
    document.getElementById('skip-btn').addEventListener('click', useSkip);
    document.getElementById('hint-btn').addEventListener('click', useHint);

    // Result screen buttons
    document.getElementById('play-again-btn').addEventListener('click', () => {
        resetGame();
        startGame();
    });

    document.getElementById('change-difficulty-btn').addEventListener('click', () => {
        resetGame();
        showScreen('start-screen');
    });
}

// ============================================
// Game Flow
// ============================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function startGame() {
    showScreen('game-screen');
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.streak = 0;
    gameState.correctAnswers = 0;
    gameState.usedSongs = [];

    updateScoreDisplay();
    loadNextQuestion();
}

function resetGame() {
    clearInterval(gameState.timer);
    gameState = {
        difficulty: null,
        currentQuestion: 0,
        totalQuestions: 10,
        score: 0,
        streak: 0,
        bestStreak: 0,
        correctAnswers: 0,
        skipsRemaining: 3,
        hintsRemaining: 2,
        timer: null,
        timeLeft: 30,
        currentSongs: [],
        usedSongs: []
    };
    updateScoreDisplay();
    updatePowerupDisplay();
}

function loadNextQuestion() {
    if (gameState.currentQuestion >= gameState.totalQuestions) {
        endGame();
        return;
    }

    gameState.currentQuestion++;
    gameState.timeLeft = 30;

    // Update question counter
    document.getElementById('question-counter').textContent =
        `Question ${gameState.currentQuestion}/${gameState.totalQuestions}`;

    // Select random songs
    selectRandomSongs();

    // Display lyric hint
    const correctSong = gameState.currentSongs[0];
    document.getElementById('lyric-hint').textContent =
        `"${correctSong.hints[gameState.difficulty]}"`;

    // Create answer options
    createAnswerOptions();

    // Start timer
    startTimer();
}

function selectRandomSongs() {
    // Get available songs (not used yet)
    let availableSongs = songDatabase.filter(
        song => !gameState.usedSongs.includes(song.title)
    );

    // If we've used all songs, reset
    if (availableSongs.length < 4) {
        gameState.usedSongs = [];
        availableSongs = [...songDatabase];
    }

    // Shuffle and select 4 songs
    const shuffled = availableSongs.sort(() => Math.random() - 0.5);
    gameState.currentSongs = shuffled.slice(0, 4);

    // Mark first song as used (correct answer)
    gameState.usedSongs.push(gameState.currentSongs[0].title);

    // Shuffle again so correct answer isn't always first
    gameState.currentSongs.sort(() => Math.random() - 0.5);
}

function createAnswerOptions() {
    const container = document.getElementById('answer-options');
    container.innerHTML = '';

    gameState.currentSongs.forEach(song => {
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.textContent = song.title;
        button.addEventListener('click', () => checkAnswer(song, button));
        container.appendChild(button);
    });
}

function checkAnswer(selectedSong, button) {
    clearInterval(gameState.timer);

    // Disable all buttons
    document.querySelectorAll('.answer-option').forEach(btn => {
        btn.classList.add('disabled');
    });

    const correctSong = gameState.currentSongs.find(
        song => song.hints[gameState.difficulty] ===
        document.getElementById('lyric-hint').textContent.replace(/"/g, '')
    );

    if (selectedSong.title === correctSong.title) {
        // Correct answer
        button.classList.add('correct');
        gameState.correctAnswers++;
        gameState.streak++;

        // Calculate score (bonus for time remaining)
        const timeBonus = Math.floor(gameState.timeLeft * 10);
        const streakBonus = gameState.streak * 50;
        gameState.score += 100 + timeBonus + streakBonus;

        if (gameState.streak > gameState.bestStreak) {
            gameState.bestStreak = gameState.streak;
        }

        updateScoreDisplay();

        setTimeout(() => {
            loadNextQuestion();
        }, 1500);
    } else {
        // Wrong answer
        button.classList.add('wrong');
        gameState.streak = 0;
        gameState.score = Math.max(0, gameState.score - 50);

        // Highlight correct answer
        document.querySelectorAll('.answer-option').forEach(btn => {
            if (btn.textContent === correctSong.title) {
                btn.classList.add('correct');
            }
        });

        updateScoreDisplay();

        setTimeout(() => {
            loadNextQuestion();
        }, 2000);
    }
}

function startTimer() {
    const timerElement = document.getElementById('timer');

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        timerElement.textContent = `${gameState.timeLeft}s`;

        if (gameState.timeLeft <= 10) {
            timerElement.classList.add('warning');
        } else {
            timerElement.classList.remove('warning');
        }

        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            timeOut();
        }
    }, 1000);
}

function timeOut() {
    gameState.streak = 0;

    // Disable all buttons and show correct answer
    const correctSong = gameState.currentSongs.find(
        song => song.hints[gameState.difficulty] ===
        document.getElementById('lyric-hint').textContent.replace(/"/g, '')
    );

    document.querySelectorAll('.answer-option').forEach(btn => {
        btn.classList.add('disabled');
        if (btn.textContent === correctSong.title) {
            btn.classList.add('correct');
        }
    });

    setTimeout(() => {
        loadNextQuestion();
    }, 2000);
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('streak').textContent = gameState.streak;
}

function updatePowerupDisplay() {
    document.getElementById('skip-count').textContent = gameState.skipsRemaining;
    document.getElementById('hint-count').textContent = gameState.hintsRemaining;

    document.getElementById('skip-btn').disabled = gameState.skipsRemaining <= 0;
    document.getElementById('hint-btn').disabled = gameState.hintsRemaining <= 0;
}

// ============================================
// Power-ups
// ============================================

function useSkip() {
    if (gameState.skipsRemaining <= 0) return;

    gameState.skipsRemaining--;
    updatePowerupDisplay();

    clearInterval(gameState.timer);
    loadNextQuestion();
}

function useHint() {
    if (gameState.hintsRemaining <= 0) return;

    gameState.hintsRemaining--;
    updatePowerupDisplay();

    // Remove 2 wrong answers
    const correctSong = gameState.currentSongs.find(
        song => song.hints[gameState.difficulty] ===
        document.getElementById('lyric-hint').textContent.replace(/"/g, '')
    );

    const buttons = Array.from(document.querySelectorAll('.answer-option'));
    const wrongButtons = buttons.filter(btn => btn.textContent !== correctSong.title);

    // Randomly select 2 wrong answers to eliminate
    const toEliminate = wrongButtons.sort(() => Math.random() - 0.5).slice(0, 2);
    toEliminate.forEach(btn => {
        btn.classList.add('eliminated');
        btn.disabled = true;
    });
}

// ============================================
// End Game
// ============================================

function endGame() {
    clearInterval(gameState.timer);
    showScreen('result-screen');

    // Update final stats
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('correct-answers').textContent =
        `${gameState.correctAnswers}/${gameState.totalQuestions}`;
    document.getElementById('best-streak').textContent = gameState.bestStreak;

    // Set result message based on performance
    const percentage = (gameState.correctAnswers / gameState.totalQuestions) * 100;
    let message = '';
    let title = '';

    if (percentage === 100) {
        title = 'Queen of Disaster! 👑';
        message = 'You know every word, you\'re in paradise now!';
    } else if (percentage >= 80) {
        title = 'Born to Die... Knowing Lana! 🌹';
        message = 'You\'re a true Lana Del Rey fan!';
    } else if (percentage >= 60) {
        title = 'Pretty Good! 💎';
        message = 'You know your way around the West Coast...';
    } else if (percentage >= 40) {
        title = 'Keep Trying! 🎵';
        message = 'Listen to more of her vintage vibes...';
    } else {
        title = 'Summertime Sadness... 😢';
        message = 'Time to dive deeper into her discography!';
    }

    document.getElementById('result-title').textContent = title;
    document.getElementById('result-message').textContent = message;
}

// ============================================
// Touch/Mobile Support
// ============================================

// Prevent double-tap zoom on buttons
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (renderer) {
        renderer.dispose();
    }
});
