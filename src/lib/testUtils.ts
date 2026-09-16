// Shared test utility functions

/**
 * Shuffles an array using Fisher-Yates algorithm
 * Used for randomizing test questions
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format time in HH:MM:SS format
 */
export function formatTimeHMS(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate test score
 */
export function calculateScore(
  answers: Record<string, string>,
  correctAnswers: Record<string, string>,
  marksPerQuestion: number = 1,
  negativeMarking: number = 0
): { score: number; correct: number; incorrect: number; unanswered: number } {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  Object.keys(correctAnswers).forEach((questionId) => {
    if (!answers[questionId]) {
      unanswered++;
    } else if (answers[questionId] === correctAnswers[questionId]) {
      correct++;
    } else {
      incorrect++;
    }
  });

  const score = (correct * marksPerQuestion) - (incorrect * negativeMarking);

  return { score, correct, incorrect, unanswered };
}
