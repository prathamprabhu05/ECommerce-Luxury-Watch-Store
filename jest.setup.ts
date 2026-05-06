import '@testing-library/jest-dom';

// Polyfill TextEncoder (needed for Firebase/Firestore tests)
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

// Polyfill fetch (needed for Auth tests)
import 'whatwg-fetch'; 

// Mock console.error/warn to keep test output clean (Optional, but helpful)
// global.console.error = jest.fn();
// global.console.warn = jest.fn();