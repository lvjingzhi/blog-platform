/**
 * Convert a string to a URL-safe slug.
 * Handles Chinese characters by appending a timestamp hash.
 */
function slugify(text) {
  if (!text) return '';

  // Check if text contains non-Latin characters
  const hasNonLatin = /[^\x00-\x7F]/.test(text);

  if (hasNonLatin) {
    // For Chinese/Non-Latin titles, use pinyin-like approach:
    // Take the title, keep alphanumeric chars, append a short hash
    const base = text
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .substring(0, 30);

    const hash = Date.now().toString(36);
    return (base || 'post') + '-' + hash;
  }

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = { slugify };