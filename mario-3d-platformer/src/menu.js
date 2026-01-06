// Menu system for navigation

class MenuManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        this.currentScreen = 'titleScreen';

        // Get all screens
        this.screens = {
            titleScreen: document.getElementById('titleScreen'),
            optionsScreen: document.getElementById('optionsScreen'),
            controlsScreen: document.getElementById('controlsScreen'),
            pauseScreen: document.getElementById('pauseScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            victoryScreen: document.getElementById('victoryScreen'),
            gameContainer: document.getElementById('gameContainer')
        };

        // Button callbacks
        this.onStartGame = null;
        this.onResumeGame = null;
        this.onQuitToMenu = null;
        this.onRetry = null;

        this.initializeButtons();
    }

    initializeButtons() {
        // Title screen buttons
        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.onStartGame) this.onStartGame();
        });

        document.getElementById('optionsBtn').addEventListener('click', () => {
            this.showScreen('optionsScreen');
        });

        document.getElementById('controlsBtn').addEventListener('click', () => {
            this.showScreen('controlsScreen');
        });

        // Options screen
        const musicVolume = document.getElementById('musicVolume');
        const musicVolumeValue = document.getElementById('musicVolumeValue');
        musicVolume.addEventListener('input', (e) => {
            const value = e.target.value;
            musicVolumeValue.textContent = value + '%';
            this.audioManager.setMusicVolume(value);
        });

        const sfxVolume = document.getElementById('sfxVolume');
        const sfxVolumeValue = document.getElementById('sfxVolumeValue');
        sfxVolume.addEventListener('input', (e) => {
            const value = e.target.value;
            sfxVolumeValue.textContent = value + '%';
            this.audioManager.setSfxVolume(value);
        });

        const cameraSensitivity = document.getElementById('cameraSensitivity');
        const cameraSensitivityValue = document.getElementById('cameraSensitivityValue');
        cameraSensitivity.addEventListener('input', (e) => {
            const value = e.target.value;
            cameraSensitivityValue.textContent = value;
            if (window.game && window.game.cameraController) {
                window.game.cameraController.setSensitivity(value);
            }
        });

        document.getElementById('optionsBackBtn').addEventListener('click', () => {
            this.showScreen('titleScreen');
        });

        // Controls screen
        document.getElementById('controlsBackBtn').addEventListener('click', () => {
            this.showScreen('titleScreen');
        });

        // Pause screen
        document.getElementById('resumeBtn').addEventListener('click', () => {
            if (this.onResumeGame) this.onResumeGame();
        });

        document.getElementById('pauseOptionsBtn').addEventListener('click', () => {
            this.showScreen('optionsScreen');
        });

        document.getElementById('quitBtn').addEventListener('click', () => {
            if (this.onQuitToMenu) this.onQuitToMenu();
        });

        // Game over screen
        document.getElementById('retryBtn').addEventListener('click', () => {
            if (this.onRetry) this.onRetry();
        });

        document.getElementById('gameOverMenuBtn').addEventListener('click', () => {
            if (this.onQuitToMenu) this.onQuitToMenu();
        });

        // Victory screen
        document.getElementById('victoryMenuBtn').addEventListener('click', () => {
            if (this.onQuitToMenu) this.onQuitToMenu();
        });
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });

        // Show requested screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
    }

    showGameOver(score) {
        document.getElementById('finalScore').textContent = `Score: ${score}`;
        this.showScreen('gameOverScreen');
        this.audioManager.playGameOverTheme();
    }

    showVictory(score, time) {
        document.getElementById('victoryScore').textContent = `Score: ${score}`;
        document.getElementById('victoryTime').textContent = `Time: ${Utils.formatTime(time)}`;
        this.showScreen('victoryScreen');
        this.audioManager.playVictoryTheme();
    }

    showLoading(show) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (show) {
            loadingScreen.classList.remove('hidden');
        } else {
            loadingScreen.classList.add('hidden');
        }
    }

    updateLoadingProgress(progress, text) {
        document.getElementById('loadingProgress').style.width = progress + '%';
        if (text) {
            document.getElementById('loadingText').textContent = text;
        }
    }
}
