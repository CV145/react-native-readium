/**
 * Gemini AI Configuration
 *
 * To use this feature, you need to:
 * 1. Get a Gemini API key from https://aistudio.google.com/app/apikey
 * 2. Replace 'YOUR_GEMINI_API_KEY_HERE' below with your actual API key
 */

// Declare process.env for TypeScript
declare const process: any;

// Try to get API key from environment variable, fallback to placeholder
let apiKey = 'AIzaSyAcm4kzidqITggXVlRUDEKopNUXcG4Gnlo';

try {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.REACT_APP_GEMINI_API_KEY
  ) {
    apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  }
} catch (e) {
  // process not available, use placeholder
}

export const GEMINI_CONFIG = {
  apiKey,
};

export const isGeminiConfigured = (): boolean => {
  return (
    GEMINI_CONFIG.apiKey !== 'YOUR_GEMINI_API_KEY_HERE' &&
    GEMINI_CONFIG.apiKey.length > 0
  );
};
