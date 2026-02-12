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

    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.sounds[name] = await this.ctx.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.error("Failed to load sound:", name, url);
        }
    }

    play(name, volume = 0.5) {
        if (this.sfxMuted || !this.sounds[name]) return;
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
        if (weapon === 'ar') this.playSynth(440, 0.05, 'square');
        else if (weapon === 'shotgun') this.playSynth(110, 0.1, 'sawtooth');
        else this.playSynth(220, 0.05, 'sine');
    }

    explode() {
        this.playSynth(50, 0.3, 'sawtooth');
    }

    click() {
        this.playSynth(880, 0.01, 'sine');
    }

    playSynth(freq, dur, type) {
        if (this.sfxMuted) return;
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
