/**
 * Quiz system exports
 * Centralized exports for quiz-related functionality
 */

// Question generation
export {
  generateYearQuestion,
  generateDateQuestion,
  generateAmountQuestion,
  generateCategoryQuestion,
  generateCrimelineTypeQuestion,
  generateQuestionPool,
  selectWeeklyQuestions,
  getEventById,
  getAllEvents,
} from "./question-generator";

// Database operations
export {
  getCurrentWeek,
  getWeekById,
  getWeekQuestions,
  hasUserCompletedWeek,
  getUserAttempt,
  saveQuizAttempt,
  getWeekLeaderboard,
  getGlobalLeaderboard,
  getUserWeekRank,
  getUserStats,
  trackInteraction,
  createQuizWeek,
} from "./db";

// Frame helpers
export {
  generateFrameHTML,
  encodeQuizState,
  decodeQuizState,
  parseFrameMessage,
  validateFrameMessage,
  getFrameBaseUrl,
  getFrameImageUrl,
  getFramePostUrl,
  shuffleArray,
  formatQuizDate,
  calculatePercentage,
  getRankEmoji,
  getStreakEmoji,
  formatScore,
  generateProgressBar,
} from "./frame-helpers";

// Types
export type {
  QuizFrameState,
  FrameButtonAction,
} from "./frame-helpers";
