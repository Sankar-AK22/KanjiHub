import React from 'react';
import { NON_N5_KANJI } from '../data/nonN5Kanji';

// Regex to match a single CJK Unified Ideograph (kanji)
const KANJI_REGEX = /[\u4e00-\u9faf\u3400-\u4dbf]/g;

/**
 * Renders a Japanese text string with furigana (ruby annotations) ONLY on kanji
 * that are outside the N5 curriculum (non-N5 kanji).
 *
 * @param text The Japanese text to render
 * @returns JSX with <ruby> annotations on non-N5 kanji
 */
export function renderWithFurigana(text: string, _legacyTestSet?: Set<string>): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  KANJI_REGEX.lastIndex = 0;

  while ((match = KANJI_REGEX.exec(text)) !== null) {
    const kanjiChar = match[0];
    const index = match.index;

    // Add any text before this kanji
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    const reading = NON_N5_KANJI[kanjiChar];

    if (reading) {
      // Non-N5 kanji with a known reading → add furigana
      parts.push(
        <ruby key={`ruby-${index}`} className="furigana-ruby">
          {kanjiChar}
          <rp>(</rp>
          <rt>{reading}</rt>
          <rp>)</rp>
        </ruby>
      );
    } else {
      // N5 kanji or unknown kanji → render plain
      parts.push(kanjiChar);
    }

    lastIndex = index + kanjiChar.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
