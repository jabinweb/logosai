/**
 * Utility functions for text processing and language detection
 */

/**
 * Detects if text contains Hindi/Devanagari characters
 */
export function isHindiText(text: string): boolean {
  // Devanagari Unicode range: U+0900–U+097F
  const devanagariRegex = /[\u0900-\u097F]/;
  return devanagariRegex.test(text);
}

/**
 * Detects if text is primarily in Hinglish (mixed Hindi-English)
 */
export function isHinglishText(text: string): boolean {
  const hasHindi = isHindiText(text);
  const hasEnglish = /[a-zA-Z]/.test(text);
  return hasHindi && hasEnglish;
}

/**
 * Returns appropriate CSS classes for text based on language detection
 */
export function getTextLanguageClass(text: string): string {
  if (isHindiText(text)) {
    return 'hindi-text';
  }
  return '';
}

/**
 * Returns the appropriate font class for detected language
 */
export function getFontClassForText(text: string): string {
  if (isHindiText(text)) {
    return 'font-eczar';
  }
  return '';
}
