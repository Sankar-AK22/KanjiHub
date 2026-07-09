export type QuestionType = 'meaning_to_kanji' | 'reading_to_kanji' | 'kanji_to_meaning' | 'sentence_fill';

export interface QuizQuestion {
  type: QuestionType;
  question: string;
  options: string[];
  answer: string;
  context?: string; // e.g. English translation for sentence
}

// Utility to shuffle an array
const shuffle = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Get random distractors excluding the correct answer
const getDistractors = (allOptions: string[], correct: string, count: number): string[] => {
  const filtered = allOptions.filter(opt => opt !== correct);
  return shuffle(filtered).slice(0, count);
};

export const generateQuestions = (recentKanji: any[], allKanji: any[]): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  const allChars = allKanji.map(k => k.char);
  const allMeanings = allKanji.map(k => k.meaning);

  recentKanji.forEach(kanji => {
    // 1. Meaning to Kanji
    questions.push({
      type: 'meaning_to_kanji',
      question: `Which kanji means "${kanji.meaning}"?`,
      options: shuffle([kanji.char, ...getDistractors(allChars, kanji.char, 3)]),
      answer: kanji.char
    });

    // 2. Kanji to Meaning
    questions.push({
      type: 'kanji_to_meaning',
      question: `What is the meaning of ${kanji.char}?`,
      options: shuffle([kanji.meaning, ...getDistractors(allMeanings, kanji.meaning, 3)]),
      answer: kanji.meaning
    });

    // 3. Reading to Kanji
    const reading = kanji.kun || kanji.on.split(',')[0];
    if (reading) {
      questions.push({
        type: 'reading_to_kanji',
        question: `Which kanji has the reading "${reading}"?`,
        options: shuffle([kanji.char, ...getDistractors(allChars, kanji.char, 3)]),
        answer: kanji.char
      });
    }

    // 4. Sentence fill-in-the-blank
    if (kanji.sentences && kanji.sentences.length > 0) {
      // Pick a random sentence
      const sentenceObj = kanji.sentences[Math.floor(Math.random() * kanji.sentences.length)];
      // Replace the kanji in the sentence with a blank
      if (sentenceObj.jp.includes(kanji.char)) {
        const blankSentence = sentenceObj.jp.replace(kanji.char, '＿＿');
        questions.push({
          type: 'sentence_fill',
          question: `Fill in the blank: ${blankSentence}`,
          context: sentenceObj.en,
          options: shuffle([kanji.char, ...getDistractors(allChars, kanji.char, 3)]),
          answer: kanji.char
        });
      }
    }
  });

  // Limit to 5-10 questions per quiz to not overwhelm
  return shuffle(questions).slice(0, 8);
};
