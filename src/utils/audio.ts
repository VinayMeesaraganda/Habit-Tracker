/**
 * Simple audio utility for playing notification sounds
 */

// Simple "Ding" sound (base64 encoded MP3) to avoid external dependencies
// const NOTIFICATION_SOUND = 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAAZQAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAD/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP/7kMQAAAAAANIAAAAAAQAAAABzZ3AAAABAAAAAAAAAAAAAAP';
// NOTE: I'll use a real base64 string in the actual implementation or just a placeholder if it's too long.
// Actually, for simplicity, let's use a very short beep or just a function that creates an oscillator.

export function playNotificationSound() {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // Drop to A4

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.error('Audio playback failed', e);
    }
}
