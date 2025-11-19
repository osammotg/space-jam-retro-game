class AudioController {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = 0.3;
        this.muted = false;
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.ctx.suspend();
        } else {
            this.ctx.resume();
        }
        return this.muted;
    }

    playTone(frequency, type, duration) {
        if (this.muted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    shoot() {
        this.playTone(880, 'square', 0.1); // High pitch pew
        setTimeout(() => this.playTone(600, 'square', 0.1), 50); // Slide down effect
    }

    explosion() {
        this.playTone(100, 'sawtooth', 0.3); // Low pitch buzz
    }

    powerup() {
        this.playTone(1200, 'sine', 0.1);
        setTimeout(() => this.playTone(1500, 'sine', 0.2), 100);
    }

    collectCoin() {
        this.playTone(2000, 'square', 0.1);
    }

    gameOver() {
        this.playTone(300, 'sawtooth', 0.5);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.5), 400);
    }
}

export default AudioController;