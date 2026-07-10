import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { N5_LESSONS } from "../data/n5";

const DEFAULT_USER_ID = "default_user";

export interface KanjiProgress {
  learned: boolean;
  tested: boolean;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  srsInterval: number;
  easeFactor: number;
  nextReviewDate: Timestamp | null;
  lastStudied: Timestamp | null;
}

// Seed all 125 N5 kanji into Firestore
export async function seedAllN5Kanji(): Promise<void> {
  const kanjiCollRef = collection(db, "kanji");
  const snapshot = await getDocs(kanjiCollRef);

  if (snapshot.size > 0) {
    console.log("Kanji already seeded in Firestore.");
    return;
  }

  console.log("Seeding 125 N5 kanji into Firestore...");
  const batch = writeBatch(db);

  for (const lesson of N5_LESSONS) {
    for (const kanji of lesson.kanji) {
      const docRef = doc(db, "kanji", kanji.char);
      batch.set(docRef, {
        character: kanji.char,
        meaning: kanji.meaning,
        onReading: kanji.on,
        kunReading: kanji.kun,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        sentences: kanji.sentences,
      });
    }
  }

  await batch.commit();
  console.log("Seeding complete!");
}

// Get all progress for a user
export async function getAllUserProgress(
  userId: string = DEFAULT_USER_ID
): Promise<Record<string, KanjiProgress>> {
  const progressRef = collection(db, "userProgress", userId, "kanjiProgress");
  const snapshot = await getDocs(progressRef);
  const progress: Record<string, KanjiProgress> = {};

  snapshot.forEach((docSnap) => {
    progress[docSnap.id] = docSnap.data() as KanjiProgress;
  });

  return progress;
}

// Mark a kanji as learned
export async function markKanjiLearned(
  kanjiChar: string,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  const progressRef = doc(
    db,
    "userProgress",
    userId,
    "kanjiProgress",
    kanjiChar
  );
  const existing = await getDoc(progressRef);

  if (existing.exists()) {
    await setDoc(
      progressRef,
      {
        learned: true,
        lastStudied: Timestamp.now(),
      },
      { merge: true }
    );
  } else {
    await setDoc(progressRef, {
      learned: true,
      tested: false,
      correctCount: 0,
      wrongCount: 0,
      accuracy: 0,
      srsInterval: 0,
      easeFactor: 2.5,
      nextReviewDate: Timestamp.now(),
      lastStudied: Timestamp.now(),
    });
  }
}

// Submit a test answer
export async function submitTestResult(
  kanjiChar: string,
  isCorrect: boolean,
  userId: string = DEFAULT_USER_ID
): Promise<void> {
  const progressRef = doc(
    db,
    "userProgress",
    userId,
    "kanjiProgress",
    kanjiChar
  );
  const existing = await getDoc(progressRef);

  let data: KanjiProgress;

  if (existing.exists()) {
    data = existing.data() as KanjiProgress;
  } else {
    data = {
      learned: true,
      tested: false,
      correctCount: 0,
      wrongCount: 0,
      accuracy: 0,
      srsInterval: 0,
      easeFactor: 2.5,
      nextReviewDate: null,
      lastStudied: null,
    };
  }

  if (isCorrect) {
    data.correctCount += 1;
    if (data.srsInterval === 0) {
      data.srsInterval = 1;
    } else if (data.srsInterval === 1) {
      data.srsInterval = 3;
    } else {
      data.srsInterval = Math.round(data.srsInterval * data.easeFactor);
    }
    data.easeFactor = Math.min(3.0, data.easeFactor + 0.1);
  } else {
    data.wrongCount += 1;
    data.srsInterval = 0;
    data.easeFactor = Math.max(1.3, data.easeFactor - 0.2);
  }

  const total = data.correctCount + data.wrongCount;
  data.accuracy = total > 0 ? Math.round((data.correctCount / total) * 100) : 0;
  data.tested = true;
  data.lastStudied = Timestamp.now();

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + data.srsInterval);
  data.nextReviewDate = Timestamp.fromDate(nextDate);

  await setDoc(progressRef, data);
}

// Get kanji due for review (SRS-based)
export async function getReviewQueue(
  userId: string = DEFAULT_USER_ID
): Promise<string[]> {
  const progressRef = collection(db, "userProgress", userId, "kanjiProgress");
  const now = Timestamp.now();
  const q = query(
    progressRef,
    where("learned", "==", true),
    where("nextReviewDate", "<=", now)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.id);
}

// Get stats summary
export async function getUserStats(
  userId: string = DEFAULT_USER_ID
): Promise<{
  totalLearned: number;
  totalTested: number;
  overallAccuracy: number;
  reviewDueCount: number;
  weakKanjiCount: number;
}> {
  const progress = await getAllUserProgress(userId);
  const entries = Object.values(progress);

  const totalLearned = entries.filter((e) => e.learned).length;
  const totalTested = entries.filter((e) => e.tested).length;

  const testedEntries = entries.filter((e) => e.tested);
  const totalCorrect = testedEntries.reduce((s, e) => s + e.correctCount, 0);
  const totalAttempts = testedEntries.reduce(
    (s, e) => s + e.correctCount + e.wrongCount,
    0
  );
  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const now = new Date();
  const reviewDueCount = entries.filter((e) => {
    if (!e.learned || !e.nextReviewDate) return false;
    const reviewDate = e.nextReviewDate.toDate();
    return reviewDate <= now;
  }).length;

  const weakKanjiCount = testedEntries.filter((e) => e.accuracy < 60).length;

  return {
    totalLearned,
    totalTested,
    overallAccuracy,
    reviewDueCount,
    weakKanjiCount,
  };
}
