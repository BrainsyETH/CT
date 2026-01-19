import eventsData from "@/data/events.json";
import type { Event, QuizQuestion, QuizDifficulty } from "@/lib/types";

const events = eventsData as Event[];

/**
 * Question templates for generating quiz questions from events
 */
const questionTemplates = {
  date: {
    when: (event: Event) => ({
      question: `When did "${event.title}" occur?`,
      correctYear: new Date(event.date).getFullYear(),
    }),
    year: (event: Event) => ({
      question: `In what year did "${event.title}" happen?`,
      correctYear: new Date(event.date).getFullYear(),
    }),
  },
  amount: {
    fundsLost: (event: Event) => {
      if (!event.crimeline?.funds_lost_usd) return null;
      const amount = event.crimeline.funds_lost_usd;
      return {
        question: `Approximately how much was lost in "${event.title}"?`,
        correctAmount: amount,
        formattedAmount: formatCurrency(amount),
      };
    },
  },
  type: {
    category: (event: Event) => ({
      question: `What category best describes "${event.title}"?`,
      correctCategory: event.category[0] || "Other",
    }),
    crimelineType: (event: Event) => {
      if (!event.crimeline) return null;
      return {
        question: `What type of incident was "${event.title}"?`,
        correctType: event.crimeline.type,
      };
    },
  },
  boolean: {
    recovered: (event: Event) => {
      if (!event.crimeline) return null;
      const recovered = event.crimeline.status === "Funds recovered";
      return {
        question: `Were the funds stolen in "${event.title}" fully recovered?`,
        correctAnswer: recovered,
      };
    },
  },
};

/**
 * Generate wrong answers for year-based questions
 */
function generateWrongYears(correctYear: number): number[] {
  const wrongYears: Set<number> = new Set();
  const range = 10; // Years before/after

  while (wrongYears.size < 3) {
    const offset = Math.floor(Math.random() * range * 2) - range;
    const wrongYear = correctYear + offset;

    if (wrongYear !== correctYear && wrongYear >= 2009 && wrongYear <= new Date().getFullYear()) {
      wrongYears.add(wrongYear);
    }
  }

  return Array.from(wrongYears);
}

/**
 * Generate wrong answers for month/year date questions
 */
function generateWrongDates(correctDate: Date): string[] {
  const wrongDates: Set<string> = new Set();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const correctYear = correctDate.getFullYear();
  const correctMonth = correctDate.getMonth();

  while (wrongDates.size < 3) {
    // Randomly decide: same year different month, or different year same/different month
    const sameYear = Math.random() > 0.5;

    if (sameYear) {
      // Same year, different month
      const wrongMonth = Math.floor(Math.random() * 12);
      if (wrongMonth !== correctMonth) {
        wrongDates.add(`${months[wrongMonth]} ${correctYear}`);
      }
    } else {
      // Different year (±1-3 years)
      const yearOffset = Math.floor(Math.random() * 6) - 3;
      const wrongYear = correctYear + yearOffset;

      if (wrongYear >= 2009 && wrongYear <= new Date().getFullYear()) {
        const month = Math.floor(Math.random() * 12);
        wrongDates.add(`${months[month]} ${wrongYear}`);
      }
    }
  }

  return Array.from(wrongDates);
}

/**
 * Generate wrong amounts for funds lost questions
 */
function generateWrongAmounts(correctAmount: number): string[] {
  const wrongAmounts: Set<string> = new Set();

  // Generate amounts that are plausible but wrong
  const multipliers = [0.1, 0.25, 0.5, 2, 4, 10];

  while (wrongAmounts.size < 3) {
    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const wrongAmount = Math.round(correctAmount * multiplier);

    if (wrongAmount !== correctAmount) {
      wrongAmounts.add(formatCurrency(wrongAmount));
    }
  }

  return Array.from(wrongAmounts);
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  } else if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(0)}M`;
  } else if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

/**
 * Get category options (for wrong answers)
 */
function getCategoryOptions(correctCategory: string): string[] {
  const allCategories = [
    "Bitcoin",
    "Ethereum",
    "DeFi",
    "NFT",
    "Exchange",
    "Regulation",
    "Altcoin",
    "Stablecoin",
    "Infrastructure",
    "Governance",
    "Other",
  ];

  const wrong = allCategories
    .filter((c) => c !== correctCategory)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return wrong;
}

/**
 * Get crimeline type options (for wrong answers)
 */
function getCrimelineTypeOptions(correctType: string): string[] {
  const allTypes = [
    "EXCHANGE HACK",
    "PROTOCOL EXPLOIT",
    "BRIDGE HACK",
    "ORACLE MANIPULATION",
    "RUG PULL",
    "FRAUD",
    "CUSTODY FAILURE",
    "LEVERAGE COLLAPSE",
    "GOVERNANCE ATTACK",
  ];

  const wrong = allTypes
    .filter((t) => t !== correctType)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return wrong;
}

/**
 * Determine difficulty based on event properties
 */
function determineDifficulty(event: Event): QuizDifficulty {
  const eventDate = new Date(event.date);
  const eventYear = eventDate.getFullYear();
  const currentYear = new Date().getFullYear();
  const yearsAgo = currentYear - eventYear;

  // Major/well-known events are easier
  const isMajorEvent =
    event.tags?.includes("MILESTONE") ||
    event.tags?.includes("ATH") ||
    (event.crimeline?.funds_lost_usd && event.crimeline.funds_lost_usd > 100_000_000);

  if (isMajorEvent && yearsAgo <= 5) {
    return "easy";
  } else if (yearsAgo <= 3) {
    return "easy";
  } else if (yearsAgo <= 7) {
    return "medium";
  } else {
    return "hard";
  }
}

/**
 * Generate a "When did X happen?" question (year-based)
 */
export function generateYearQuestion(event: Event): QuizQuestion | null {
  const template = questionTemplates.date.year(event);
  const correctYear = template.correctYear;
  const wrongYears = generateWrongYears(correctYear);

  const allAnswers = [correctYear.toString(), ...wrongYears.map(String)];
  const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

  return {
    id: "", // Will be generated by database
    question_text: template.question,
    correct_answer: correctYear.toString(),
    wrong_answer_1: shuffledAnswers.filter((a) => a !== correctYear.toString())[0],
    wrong_answer_2: shuffledAnswers.filter((a) => a !== correctYear.toString())[1],
    wrong_answer_3: shuffledAnswers.filter((a) => a !== correctYear.toString())[2],
    event_id: event.id,
    event_date: event.date,
    difficulty: determineDifficulty(event),
    category: event.category[0],
    tags: event.tags,
    explanation: `${event.title} occurred on ${new Date(event.date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}. ${event.summary.split(".")[0]}.`,
    image_url: event.image,
  };
}

/**
 * Generate a "When did X happen?" question (month + year)
 */
export function generateDateQuestion(event: Event): QuizQuestion | null {
  const eventDate = new Date(event.date);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const correctAnswer = `${months[eventDate.getMonth()]} ${eventDate.getFullYear()}`;
  const wrongDates = generateWrongDates(eventDate);

  const allAnswers = [correctAnswer, ...wrongDates];
  const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

  return {
    id: "",
    question_text: questionTemplates.date.when(event).question,
    correct_answer: correctAnswer,
    wrong_answer_1: shuffledAnswers.filter((a) => a !== correctAnswer)[0],
    wrong_answer_2: shuffledAnswers.filter((a) => a !== correctAnswer)[1],
    wrong_answer_3: shuffledAnswers.filter((a) => a !== correctAnswer)[2],
    event_id: event.id,
    event_date: event.date,
    difficulty: determineDifficulty(event),
    category: event.category[0],
    tags: event.tags,
    explanation: `${event.title} occurred on ${eventDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}. ${event.summary.split(".")[0]}.`,
    image_url: event.image,
  };
}

/**
 * Generate a funds lost amount question
 */
export function generateAmountQuestion(event: Event): QuizQuestion | null {
  const template = questionTemplates.amount.fundsLost(event);
  if (!template) return null;

  const correctAmount = template.formattedAmount;
  const wrongAmounts = generateWrongAmounts(template.correctAmount);

  const allAnswers = [correctAmount, ...wrongAmounts];
  const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

  return {
    id: "",
    question_text: template.question,
    correct_answer: correctAmount,
    wrong_answer_1: shuffledAnswers.filter((a) => a !== correctAmount)[0],
    wrong_answer_2: shuffledAnswers.filter((a) => a !== correctAmount)[1],
    wrong_answer_3: shuffledAnswers.filter((a) => a !== correctAmount)[2],
    event_id: event.id,
    event_date: event.date,
    difficulty: "medium", // Amount questions are generally medium
    category: event.category[0],
    tags: event.tags,
    explanation: `The ${event.title} resulted in approximately ${correctAmount} in losses. ${
      event.crimeline?.aftermath || ""
    }`,
    image_url: event.image,
  };
}

/**
 * Generate a category question
 */
export function generateCategoryQuestion(event: Event): QuizQuestion | null {
  const template = questionTemplates.type.category(event);
  const correctCategory = template.correctCategory;
  const wrongCategories = getCategoryOptions(correctCategory);

  return {
    id: "",
    question_text: template.question,
    correct_answer: correctCategory,
    wrong_answer_1: wrongCategories[0],
    wrong_answer_2: wrongCategories[1],
    wrong_answer_3: wrongCategories[2],
    event_id: event.id,
    event_date: event.date,
    difficulty: "easy",
    category: event.category[0],
    tags: event.tags,
    explanation: `${event.title} is categorized under ${correctCategory}. ${event.summary.split(".")[0]}.`,
    image_url: event.image,
  };
}

/**
 * Generate a crimeline type question
 */
export function generateCrimelineTypeQuestion(event: Event): QuizQuestion | null {
  const template = questionTemplates.type.crimelineType(event);
  if (!template) return null;

  const correctType = template.correctType;
  const wrongTypes = getCrimelineTypeOptions(correctType);

  return {
    id: "",
    question_text: template.question,
    correct_answer: correctType,
    wrong_answer_1: wrongTypes[0],
    wrong_answer_2: wrongTypes[1],
    wrong_answer_3: wrongTypes[2],
    event_id: event.id,
    event_date: event.date,
    difficulty: "medium",
    category: event.category[0],
    tags: event.tags,
    explanation: `${event.title} was a ${correctType}. ${event.crimeline?.root_cause?.join(", ") || ""}`,
    image_url: event.image,
  };
}

/**
 * Generate a pool of questions from all events
 */
export function generateQuestionPool(count: number = 100): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Shuffle events for variety
  const shuffledEvents = [...events].sort(() => Math.random() - 0.5);

  for (const event of shuffledEvents) {
    if (questions.length >= count) break;

    // Try different question types
    const questionGenerators = [
      () => generateYearQuestion(event),
      () => generateDateQuestion(event),
      () => generateAmountQuestion(event),
      () => generateCategoryQuestion(event),
      () => generateCrimelineTypeQuestion(event),
    ];

    // Randomly pick a generator
    const generator = questionGenerators[Math.floor(Math.random() * questionGenerators.length)];
    const question = generator();

    if (question) {
      questions.push(question);
    }
  }

  return questions;
}

/**
 * Select 7 questions for a week (balanced difficulty)
 */
export function selectWeeklyQuestions(questionPool: QuizQuestion[]): QuizQuestion[] {
  const easy = questionPool.filter((q) => q.difficulty === "easy");
  const medium = questionPool.filter((q) => q.difficulty === "medium");
  const hard = questionPool.filter((q) => q.difficulty === "hard");

  // Distribution: 2 easy, 3 medium, 2 hard
  const selected: QuizQuestion[] = [];

  // Shuffle each difficulty pool
  easy.sort(() => Math.random() - 0.5);
  medium.sort(() => Math.random() - 0.5);
  hard.sort(() => Math.random() - 0.5);

  // Select questions
  selected.push(...easy.slice(0, 2));
  selected.push(...medium.slice(0, 3));
  selected.push(...hard.slice(0, 2));

  // Shuffle the final selection so difficulty is mixed
  return selected.sort(() => Math.random() - 0.5);
}

/**
 * Get a specific event by ID (for question generation)
 */
export function getEventById(eventId: string): Event | null {
  return events.find((e) => e.id === eventId) || null;
}

/**
 * Get all events (useful for manual question creation)
 */
export function getAllEvents(): Event[] {
  return events;
}
