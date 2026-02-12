class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        this.masterGain.connect(this.ctx.destination);
        this.sounds = {};
        this.musicMuted = false;
        this.sfxMuted = false;
    }

    async resume() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    async loadAllSounds() {
        // Using lowercase 'sounds/' for cross-platform (Linux/GitHub Pages) compatibility
        const soundFiles = {
            pistol: 'sounds/pistol.mp3',
            shotgun: 'sounds/shotgun.mp3',
            rifle: 'sounds/rifle.mp3',
            sniper: 'sounds/sniper.mp3',
            flamethrower: 'sounds/flamethrower.mp3',
            explosion: 'sounds/explosion.mp3',
            laser: 'sounds/laser.mp3',
            spikes: 'sounds/spikes.mp3',
            bg: 'sounds/bgsound.mp3'
        };

        for (const [name, url] of Object.entries(soundFiles)) {
            await this.loadSound(name, url);
        }
    }

    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            this.sounds[name] = await this.ctx.decodeAudioData(arrayBuffer);
            console.log(`Loaded sound: ${name}`);
        } catch (e) {
            console.warn("Failed to load sound:", name, url, e);
            // Fallback to synth sounds if file loading fails
        }
    }

    play(name, volume = 0.5) {
        if (this.sfxMuted || !this.sounds[name]) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const source = this.ctx.createBufferSource();
        source.buffer = this.sounds[name];
        const gain = this.ctx.createGain();
        gain.gain.value = volume;
        gain.connect(this.masterGain);
        source.connect(gain);
        source.start(0);
    }

    playFile(name, volume) {
        this.play(name, volume);
    }

    shoot(weapon) {
        if (weapon === 'ar') {
            if (this.sounds.rifle) this.play('rifle', 0.1);
            else this.playSynth(440, 0.05, 'square');
        } else if (weapon === 'shotgun') {
            if (this.sounds.shotgun) this.play('shotgun', 0.3);
            else this.playSynth(110, 0.1, 'sawtooth');
        } else if (weapon === 'pistol') {
            if (this.sounds.pistol) this.play('pistol', 0.2);
            else this.playSynth(220, 0.05, 'sine');
        } else if (weapon === 'sniper') {
            if (this.sounds.sniper) this.play('sniper', 0.4);
            else this.playSynth(330, 0.1, 'sine');
        } else if (weapon === 'flamethrower') {
            if (this.sounds.flamethrower) this.play('flamethrower', 0.1);
        }
    }

    explode() {
        if (this.sounds.explosion) this.play('explosion', 0.5);
        else this.playSynth(50, 0.3, 'sawtooth');
    }

    click() {
        this.playSynth(880, 0.01, 'sine');
    }

    playSynth(freq, dur, type) {
        if (this.sfxMuted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + dur);
        g.gain.setValueAtTime(0.3, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + dur);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + dur);
    }

    toggleMusic() { this.musicMuted = !this.musicMuted; return this.musicMuted; }
    toggleSFX() { this.sfxMuted = !this.sfxMuted; return this.sfxMuted; }
}

GAME.soundManager = new SoundManager();
