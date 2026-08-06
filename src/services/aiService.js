import axios from 'axios';

// Map of user-facing language names to standard ISO codes used by MyMemory / Chrome Translate
const LANG_CODES = {
  'English': 'en',
  'Hindi': 'hi',
  'Gujarati': 'gu',
  'Marathi': 'mr',
  'Tamil': 'ta',
  'Telugu': 'te',
  'Bengali': 'bn',
  'Punjabi': 'pa',
  'Urdu': 'ur',
  'French': 'fr',
  'German': 'de',
  'Spanish': 'es',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Chinese (Simplified)': 'zh-CN',
  'Arabic': 'ar',
  'Russian': 'ru'
};

/**
 * Sends a request to the Google Gemini API (Tier 0 - Premium Cloud AI).
 */
const callGeminiAPI = async (text, promptInstruction, apiKey) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [{ parts: [{ text: `${promptInstruction}\n\nText to process:\n"""\n${text}\n"""` }] }],
    generationConfig: {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  const response = await axios.post(url, requestBody, {
    headers: { 'Content-Type': 'application/json' }
  });

  const outputText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!outputText) {
    throw new Error('Received an empty response from the Gemini API.');
  }
  return outputText.trim();
};

/**
 * Tier 1: Free Public Keyless Translation (MyMemory API)
 */
const translateMyMemory = async (text, sourceLangCode, targetLangCode) => {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLangCode}|${targetLangCode}`;
    const response = await axios.get(url);
    
    if (response.data?.responseStatus === 200) {
      return response.data.responseData.translatedText;
    }
    
    // Check for quota/rate limit error
    const details = response.data?.responseDetails || 'Unknown error';
    throw new Error(`MyMemory API: ${details}`);
  } catch (error) {
    const msg = error.response?.data?.responseDetails || error.message;
    throw new Error(`MyMemory API failed: ${msg}`);
  }
};

/**
 * Tier 2: Browser Local Translation (Chrome window.translation API)
 */
const translateChromeLocal = async (text, sourceLangCode, targetLangCode) => {
  if (!window.translation) {
    throw new Error('Browser Local Translation API (window.translation) is not supported in this browser.');
  }

  try {
    const canTranslate = await window.translation.canTranslate({
      sourceLanguage: sourceLangCode,
      targetLanguage: targetLangCode
    });

    if (canTranslate === 'no') {
      throw new Error(`Browser local translator cannot translate from "${sourceLangCode}" to "${targetLangCode}".`);
    }

    const translator = await window.translation.createTranslator({
      sourceLanguage: sourceLangCode,
      targetLanguage: targetLangCode
    });

    const result = await translator.translate(text);
    if (translator.destroy) translator.destroy();
    return result;
  } catch (error) {
    throw new Error(`Chrome Local AI translation failed: ${error.message}`);
  }
};

/**
 * Tier 2: Browser Local Rewrite (Chrome window.ai.rewriter API)
 */
const improveChromeLocal = async (text) => {
  const ai = window.ai || window.model;
  if (!ai || !ai.rewriter) {
    throw new Error('Browser Local Rewriter API (window.ai.rewriter) is not supported or not enabled in this browser.');
  }

  try {
    const capabilities = await ai.rewriter.capabilities();
    if (capabilities.available === 'no') {
      throw new Error('Chrome Local Rewriter model is not available or download is pending.');
    }

    const rewriter = await ai.rewriter.create({
      sharedContext: 'Rewrite the text to improve its English grammar, vocabulary, readability, and sentence flow.',
      tone: 'professional',
      format: 'as-is'
    });

    const result = await rewriter.rewrite(text);
    if (rewriter.destroy) rewriter.destroy();
    return result;
  } catch (error) {
    throw new Error(`Chrome Local AI rewriter failed: ${error.message}`);
  }
};

/**
 * Main English Improvement function (orchestrates Fallback Chain)
 */
export const improveEnglish = async (text, apiKey) => {
  // If API Key is present, run premium Cloud AI immediately (Tier 0)
  if (apiKey) {
    const instruction = 
      `You are an expert English copyeditor. Improve the grammar, spelling, punctuation, vocabulary, and readability of the text. 
Preserve the meaning and format. Do NOT wrap output in code blocks. Return ONLY the improved text.`;
    return callGeminiAPI(text, instruction, apiKey);
  }

  const errors = [];

  // Tier 1: Keyless Double-Translation (Back-Translation via MyMemory)
  try {
    // English -> Spanish -> English
    const spanish = await translateMyMemory(text, 'en', 'es');
    return await translateMyMemory(spanish, 'es', 'en');
  } catch (err) {
    console.warn('Tier 1: Keyless Back-Translation failed. Trying Tier 2 (Local AI)...', err);
    errors.push(err.message);
  }

  // Tier 2: Chrome Local AI Rewriter
  try {
    return await improveChromeLocal(text);
  } catch (err) {
    console.warn('Tier 2: Browser Local AI Rewriter failed. No further options available.', err);
    errors.push(err.message);
  }

  // Throw descriptive error detailing why keyless processing failed
  throw new Error(
    `Failed to improve English text keylessly:\n` +
    `1. ${errors[0] || 'Unknown error'}\n` +
    `2. ${errors[1] || 'Unknown error'}\n\n` +
    `Please configure a Gemini API key in Settings ⚙️ to run via Premium Cloud AI.`
  );
};

/**
 * Main Translation function (orchestrates Fallback Chain)
 */
export const translateText = async (text, targetLanguageName, apiKey) => {
  const targetCode = LANG_CODES[targetLanguageName] || 'es';

  // If API Key is present, run premium Cloud AI immediately (Tier 0)
  if (apiKey) {
    const instruction = 
      `You are a professional translator. Translate the following text into ${targetLanguageName}.
Preserve meaning and format. Do NOT wrap output in code blocks. Return ONLY the translated text.`;
    return callGeminiAPI(text, instruction, apiKey);
  }

  const errors = [];

  // Tier 1: MyMemory Keyless Translation
  try {
    return await translateMyMemory(text, 'en', targetCode);
  } catch (err) {
    console.warn('Tier 1: MyMemory Translation failed. Trying Tier 2 (Local AI)...', err);
    errors.push(err.message);
  }

  // Tier 2: Chrome On-Device Translation API
  try {
    return await translateChromeLocal(text, 'en', targetCode);
  } catch (err) {
    console.warn('Tier 2: Browser Local Translation failed. No further options available.', err);
    errors.push(err.message);
  }

  // Throw descriptive error detailing why keyless translation failed
  throw new Error(
    `Failed to translate text keylessly:\n` +
    `1. ${errors[0] || 'Unknown error'}\n` +
    `2. ${errors[1] || 'Unknown error'}\n\n` +
    `Please configure a Gemini API key in Settings ⚙️ to run via Premium Cloud AI.`
  );
};
