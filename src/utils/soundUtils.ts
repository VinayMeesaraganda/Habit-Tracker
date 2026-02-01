/**
 * SoundUtils - Shared audio manager for focus timer notifications
 * Uses Web Audio API to generate pleasant tones without external assets
 */

export class SoundManager {
    private static context: AudioContext | null = null;

    private static getContext(): AudioContext {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.context;
    }

    static playCompletion(): void {
        try {
            const ctx = this.getContext();
            const playTone = (freq: number, startTime: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            const now = ctx.currentTime;
            playTone(523.25, now, 0.8);      // C5
            playTone(659.25, now + 0.1, 0.8); // E5
            playTone(783.99, now + 0.2, 0.8); // G5
            playTone(1046.50, now + 0.3, 1.0); // C6
        } catch (e) {
            console.log('Audio not supported', e);
        }
    }

    static playBreakComplete(): void {
        try {
            const ctx = this.getContext();
            const playTone = (freq: number, startTime: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            const now = ctx.currentTime;
            playTone(392, now, 0.4);      // G4
            playTone(523.25, now + 0.15, 0.5); // C5
            playTone(659.25, now + 0.3, 0.6);  // E5
        } catch (e) {
            console.log('Audio not supported', e);
        }
    }
}
