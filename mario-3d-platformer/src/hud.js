// HUD (Heads-Up Display) manager

class HUDManager {
    constructor() {
        // Get HUD elements
        this.livesElement = document.getElementById('lives');
        this.coinsElement = document.getElementById('coins');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.starCountElement = document.getElementById('starCount');
        this.powerUpIndicator = document.getElementById('powerUpIndicator');

        // Game timer
        this.gameTime = 400; // Start time in seconds
        this.timerRunning = false;
    }

    update(player, collectibleManager) {
        // Update player stats
        this.livesElement.textContent = player.lives;
        this.coinsElement.textContent = player.coins.toString().padStart(2, '0');
        this.scoreElement.textContent = player.score.toString().padStart(6, '0');

        // Update stars
        const totalStars = collectibleManager.getTotalStars();
        const collectedStars = totalStars - collectibleManager.getActiveStars();
        this.starCountElement.textContent = `${collectedStars}/${totalStars}`;

        // Update power-up indicator
        if (player.powerUpState !== 'small') {
            this.powerUpIndicator.classList.add('active');
            if (player.powerUpState === 'big') {
                this.powerUpIndicator.style.background = '#ff0000';
            } else if (player.powerUpState === 'fire') {
                this.powerUpIndicator.style.background = 'linear-gradient(45deg, #ff6600, #ffff00)';
            }
        } else {
            this.powerUpIndicator.classList.remove('active');
        }

        // Update invincibility effect
        if (player.invincible) {
            this.powerUpIndicator.style.background = 'linear-gradient(45deg, #ffff00, #ffffff)';
            this.powerUpIndicator.classList.add('active');
        }
    }

    startTimer() {
        this.timerRunning = true;
    }

    stopTimer() {
        this.timerRunning = false;
    }

    updateTimer(deltaTime) {
        if (!this.timerRunning) return;

        this.gameTime -= deltaTime;
        if (this.gameTime < 0) {
            this.gameTime = 0;
            return true; // Time's up!
        }

        this.timerElement.textContent = Math.ceil(this.gameTime);

        // Warning when time is low
        if (this.gameTime < 30) {
            this.timerElement.style.color = '#ff0000';
        } else if (this.gameTime < 100) {
            this.timerElement.style.color = '#ffcc00';
        } else {
            this.timerElement.style.color = '#fff';
        }

        return false;
    }

    reset() {
        this.gameTime = 400;
        this.timerElement.style.color = '#fff';
        this.timerRunning = false;
    }

    show() {
        document.getElementById('hud').style.display = 'block';
    }

    hide() {
        document.getElementById('hud').style.display = 'none';
    }
}
