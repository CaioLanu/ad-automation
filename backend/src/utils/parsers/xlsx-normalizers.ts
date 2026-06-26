const lowercaseWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

const toTitleCaseWord = (word: string, isFirst: boolean) => {
  const lower = word.toLowerCase();
  if (!isFirst && lowercaseWords.has(lower)) return lower;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const normalizeDisplayText = (value: unknown) => {
  const text = value == null ? '' : String(value).trim();
  if (!text) return '';

  return text
    .toLowerCase()
    .split(/(\s+)/)
    .map((part, index, parts) => {
      if (/^\s+$/.test(part)) return part;
      const isFirstWord = parts.slice(0, index).every((item) => /^\s+$/.test(item));
      return toTitleCaseWord(part, isFirstWord);
    })
    .join('')
    .replace(/\s+/g, ' ');
};

export const normalizeNumericText = (value: unknown) => {
  const text = value == null ? '' : String(value);
  return text.replace(/\D+/g, '').trim();
};

export const normalizeEmailText = (value: unknown) => {
  const text = value == null ? '' : String(value).trim();
  return text ? text.toLowerCase() : '';
};
