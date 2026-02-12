import { vi } from 'vitest';

// Mock AudioContext for JSDOM
global.window.AudioContext = vi.fn().mockImplementation(() => ({
    createGain: vi.fn().mockReturnValue({
        gain: { value: 0 },
        connect: vi.fn()
    }),
    destination: {},
    currentTime: 0,
    decodeAudioData: vi.fn(),
    createBufferSource: vi.fn().mockReturnValue({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
    }),
    createOscillator: vi.fn().mockReturnValue({
        type: 'sine',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
    })
}));

global.window.webkitAudioContext = global.window.AudioContext;
