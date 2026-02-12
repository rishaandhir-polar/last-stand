class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        this.masterGain.connect(this.ctx.destination);
        this.sounds = {};
        this.musicMuted = false;
        this.sfxMuted = false;
        this.legacySounds = {}; // For file:// compatibility
        this.musicSource = null;
        this.bgMusicStarted = false;
    }

    async resume() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    async loadAllSounds() {
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
            // Load for both Web Audio (High Performance) and Legacy (file:// compatibility)
            this.legacySounds[name] = new Audio(url);
            this.loadSound(name, url);
        }
    }

    async loadSound(name, url) {
        if (window.location.protocol === 'file:') return; // Skip fetch on file://
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            this.sounds[name] = await this.ctx.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.warn("WebAudio loading failed, will use legacy fallback for:", name);
        }
    }

    play(name, volume = 0.5) {
        if (this.sfxMuted) return;

        // Priority 1: Web Audio (Lowest Latency, Overlapping)
        if (this.sounds[name]) {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const source = this.ctx.createBufferSource();
            source.buffer = this.sounds[name];
            const gain = this.ctx.createGain();
            gain.gain.value = volume;
            gain.connect(this.masterGain);
            source.connect(gain);
            source.start(0);
        }
        // Priority 2: Legacy Audio (Works on file://)
        else if (this.legacySounds[name]) {
            const clone = this.legacySounds[name].cloneNode();
            clone.volume = volume * this.masterGain.gain.value;
            clone.play().catch(() => { });
        }
    }

    playFile(name, volume) {
        this.play(name, volume);
    }

    shoot(weapon) {
        const weaponMap = { 'ar': 'rifle', 'shotgun': 'shotgun', 'pistol': 'pistol', 'sniper': 'sniper', 'flamethrower': 'flamethrower' };
        const soundName = weaponMap[weapon] || 'pistol';
        const volumes = { 'rifle': 0.1, 'shotgun': 0.3, 'pistol': 0.2, 'sniper': 0.4, 'flamethrower': 0.1 };
        this.play(soundName, volumes[soundName]);
    }

    explode() {
        this.play('explosion', 0.5);
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

    toggleMusic() {
        this.musicMuted = !this.musicMuted;
        if (this.musicMuted) {
            if (this.musicSource) this.musicSource.stop();
            if (this.legacySounds['bg']) this.legacySounds['bg'].pause();
        } else {
            this.startMusic();
        }
        return this.musicMuted;
    }

    startMusic() {
        if (this.musicMuted || this.bgMusicStarted) return;
        this.bgMusicStarted = true;

        if (this.sounds['bg']) {
            const playLoop = () => {
                if (this.musicMuted) return;
                this.musicSource = this.ctx.createBufferSource();
                this.musicSource.buffer = this.sounds['bg'];
                this.musicSource.loop = true;
                const gain = this.ctx.createGain();
                gain.gain.value = 0.3;
                gain.connect(this.masterGain);
                this.musicSource.connect(gain);
                this.musicSource.start(0);
            };
            playLoop();
        } else if (this.legacySounds['bg']) {
            this.legacySounds['bg'].loop = true;
            this.legacySounds['bg'].volume = 0.3;
            this.legacySounds['bg'].play().catch(() => { this.bgMusicStarted = false; });
        }
    }

    toggleSFX() { this.sfxMuted = !this.sfxMuted; return this.sfxMuted; }
}

GAME.soundManager = new SoundManager();
