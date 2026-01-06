// Audio system for music and sound effects

class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
        this.context = null;
        this.initialized = false;
    }

    init() {
        // Create audio context
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }

        // Create sound effects using Web Audio API (synthesized sounds)
        this.createSoundEffects();
    }

    createSoundEffects() {
        // We'll create synthesized sound effects since we don't have audio files
        this.soundDefinitions = {
            jump: { frequency: 400, duration: 0.1, type: 'sine' },
            doubleJump: { frequency: 600, duration: 0.15, type: 'sine' },
            coin: { frequency: 800, duration: 0.1, type: 'square' },
            powerUp: { frequency: 600, duration: 0.3, type: 'triangle' },
            enemyDefeat: { frequency: 200, duration: 0.2, type: 'sawtooth' },
            damage: { frequency: 100, duration: 0.3, type: 'sawtooth' },
            star: { frequency: 1000, duration: 0.5, type: 'sine' },
            oneUp: { frequency: 700, duration: 0.4, type: 'triangle' }
        };
    }

    playSound(soundName) {
        if (!this.initialized || !this.soundDefinitions[soundName]) return;

        const soundDef = this.soundDefinitions[soundName];
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.type = soundDef.type;
        oscillator.frequency.value = soundDef.frequency;

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + soundDef.duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + soundDef.duration);
    }

    playMelody(notes, tempo = 0.15) {
        if (!this.initialized) return;

        let time = this.context.currentTime;

        notes.forEach((note, index) => {
            if (note === 0) {
                time += tempo;
                return;
            }

            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            oscillator.type = 'square';
            oscillator.frequency.value = note;

            gainNode.gain.setValueAtTime(this.musicVolume * 0.2, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + tempo * 0.9);

            oscillator.start(time);
            oscillator.stop(time + tempo);

            time += tempo;
        });
    }

    playVictoryTheme() {
        // Simple victory melody
        const melody = [523, 523, 523, 659, 784, 0, 659, 784];
        this.playMelody(melody, 0.2);
    }

    playGameOverTheme() {
        // Simple game over melody
        const melody = [392, 370, 349, 330, 294, 262, 294, 247];
        this.playMelody(melody, 0.25);
    }

    playStarTheme() {
        // Invincibility star theme
        const melody = [784, 880, 988, 1047, 1175, 1319, 1397, 1568];
        this.playMelody(melody, 0.1);
    }

    setMusicVolume(volume) {
        this.musicVolume = volume / 100;
    }

    setSfxVolume(volume) {
        this.sfxVolume = volume / 100;
    }

    stopAll() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
}
