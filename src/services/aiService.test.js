import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { translateText, improveEnglish } from './aiService';

// Mock axios
vi.mock('axios');

describe('aiService - Translation & English Improvement Tiers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global window mock variables
    if (typeof window !== 'undefined') {
      delete window.translation;
      delete window.ai;
    } else {
      global.window = {};
    }
  });

  // ==========================================
  // 1. GEMINI API (TIER 0 - PREMIUM CLOUD)
  // ==========================================
  describe('Tier 0 - Gemini API Integration', () => {
    it('should call Gemini API when API key is provided for Translation', async () => {
      const mockResult = 'Hola Mundo';
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [{
            content: {
              parts: [{ text: mockResult }]
            }
          }]
        }
      });

      const result = await translateText('Hello World', 'Spanish', 'fake-api-key');
      
      expect(result).toBe(mockResult);
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          contents: expect.any(Array)
        }),
        expect.any(Object)
      );
    });

    it('should call Gemini API when API key is provided for English Improvement', async () => {
      const mockResult = 'Hello World';
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [{
            content: {
              parts: [{ text: mockResult }]
            }
          }]
        }
      });

      const result = await improveEnglish('Hello world', 'fake-api-key');
      
      expect(result).toBe(mockResult);
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // 2. MYMEMORY API (TIER 1 - KEYLESS WEB)
  // ==========================================
  describe('Tier 1 - MyMemory API Keyless', () => {
    it('should call MyMemory translation API when no API key is set', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          responseStatus: 200,
          responseData: { translatedText: 'Bonjour le monde' }
        }
      });

      const result = await translateText('Hello World', 'French', '');
      
      expect(result).toBe('Bonjour le monde');
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.mymemory.translated.net/get?q=Hello%20World&langpair=en|fr'
      );
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should call double translation (Back-Translation) for English Improvement', async () => {
      // 1. English to Spanish
      axios.get.mockResolvedValueOnce({
        data: {
          responseStatus: 200,
          responseData: { translatedText: 'Hola Mundo' }
        }
      });
      // 2. Spanish back to English
      axios.get.mockResolvedValueOnce({
        data: {
          responseStatus: 200,
          responseData: { translatedText: 'Hello World (Polished)' }
        }
      });

      const result = await improveEnglish('Hello World', '');
      
      expect(result).toBe('Hello World (Polished)');
      expect(axios.get).toHaveBeenCalledTimes(2);
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        'https://api.mymemory.translated.net/get?q=Hello%20World&langpair=en|es'
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://api.mymemory.translated.net/get?q=Hola%20Mundo&langpair=es|en'
      );
    });
  });

  // ==========================================
  // 3. CHROME LOCAL AI (TIER 2 - LOCAL ENGINE)
  // ==========================================
  describe('Tier 2 - Chrome On-Device AI fallback', () => {
    it('should fall back to window.translation when MyMemory fails', async () => {
      // Mock MyMemory fail
      axios.get.mockRejectedValueOnce(new Error('Rate limit exceeded'));

      // Mock Chrome translation API
      const mockTranslate = vi.fn().mockResolvedValue('Bonjour Local');
      const mockDestroy = vi.fn();
      global.window.translation = {
        canTranslate: vi.fn().mockResolvedValue('readily'),
        createTranslator: vi.fn().mockResolvedValue({
          translate: mockTranslate,
          destroy: mockDestroy
        })
      };

      const result = await translateText('Hello World', 'French', '');
      
      expect(result).toBe('Bonjour Local');
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(global.window.translation.canTranslate).toHaveBeenCalledWith({
        sourceLanguage: 'en',
        targetLanguage: 'fr'
      });
      expect(mockTranslate).toHaveBeenCalledWith('Hello World');
      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should fall back to window.ai.rewriter when back-translation fails', async () => {
      // Mock MyMemory fail
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      // Mock Chrome local rewriter API
      const mockRewrite = vi.fn().mockResolvedValue('Hello World (Rewritten locally)');
      const mockDestroy = vi.fn();
      global.window.ai = {
        rewriter: {
          capabilities: vi.fn().mockResolvedValue({ available: 'readily' }),
          create: vi.fn().mockResolvedValue({
            rewrite: mockRewrite,
            destroy: mockDestroy
          })
        }
      };

      const result = await improveEnglish('Hello World', '');
      
      expect(result).toBe('Hello World (Rewritten locally)');
      expect(axios.get).toHaveBeenCalledTimes(1); // failed in first step
      expect(mockRewrite).toHaveBeenCalledWith('Hello World');
      expect(mockDestroy).toHaveBeenCalled();
    });
  });

  // ==========================================
  // 4. DIAGNOSTIC ERRORS (TIER 3 - ALL FAIL)
  // ==========================================
  describe('Tier 3 - Fallback Diagnostic Failures', () => {
    it('should throw comprehensive error if all translation tiers fail', async () => {
      // MyMemory fails
      axios.get.mockRejectedValueOnce(new Error('MyMemory API error'));
      
      // Chrome translation fails/not supported (window.translation is undefined)
      
      await expect(translateText('Hello World', 'French', '')).rejects.toThrow(
        /Failed to translate text keylessly/
      );
    });

    it('should throw comprehensive error if all improvement tiers fail', async () => {
      // MyMemory fails
      axios.get.mockRejectedValueOnce(new Error('MyMemory API error'));
      
      // Chrome rewriter fails/not supported
      
      await expect(improveEnglish('Hello World', '')).rejects.toThrow(
        /Failed to improve English text keylessly/
      );
    });
  });
});
