import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for jsdom
Object.assign(globalThis, { TextEncoder, TextDecoder });
