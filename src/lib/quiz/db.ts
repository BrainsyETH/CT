import { getSupabase } from "@/lib/supabase";
import type {
  QuizWeek,
  QuizQuestion,
  WeekLeaderboardEntry,
  LeaderboardEntry,
  FrameInteraction,
} from "@/lib/types";

/**
 * Get the current active quiz week
 */
export async function getCurrentWeek(): Promise<QuizWeek | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("quiz_weeks")
    .select("*")
    .eq("status", "active")
    .lte("start_date", new Date().toISOString().split("T")[0])
    .gte("end_date", new Date().toISOString().split("T")[0])
    .single();

  if (error) {
    console.error("[Quiz DB] Error getting current week:", error);
    return null;
  }

  return data;
}

/**
 * Get a quiz week by ID
 */
export async function getWeekById(weekId: string): Promise<QuizWeek | null> {
  const supabase = getSupabase();

  const { data, error} = await supabase
    .from("quiz_weeks")
    .select("*")
    .eq("id", weekId)
    .single();

  if (error) {
    console.error("[Quiz DB] Error getting week:", error);
    return null;
  }

  return data;
}

/**
 * Get or assign today's question for a user (random assignment from 2-3 question pool)
 * Uses database function for atomic random selection
 */
export async function getOrAssignTodaysQuestion(
  fid: number,
  weekId: string
): Promise<QuizQuestion | null> {
  const supabase = getSupabase();

  // Call database function to get or assign question
  const { data: questionId, error: assignError } = await supabase.rpc(
    "get_or_assign_todays_question",
    {
      user_fid: fid,
      week_uuid: weekId,
    }
  );

  if (assignError) {
    console.error("[Quiz DB] Error getting/assigning today's question:", assignError);
    return null;
  }

  if (!questionId) {
    return null; // No questions available for today
  }

  // Fetch the full question details
  const { data: question, error: questionError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("id", questionId)
    .single();

  if (questionError) {
    console.error("[Quiz DB] Error fetching question:", questionError);
    return null;
  }

  return question;
}

/**
 * Get all questions for a week (for admin/review)
 * Returns questions grouped by day
 */
export async function getWeekQuestions(weekId: string): Promise<
  Record<
    number,
    Array<{
      question: QuizQuestion;
      questionDate: string;
    }>
  >
> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("week_questions")
    .select(
      `
      day_of_week,
      question_date,
      quiz_questions (*)
    `
    )
    .eq("week_id", weekId)
    .order("day_of_week", { ascending: true });

  if (error) {
    console.error("[Quiz DB] Error getting week questions:", error);
    return {};
  }

  // Group questions by day
  const questionsByDay: Record<number, Array<{ question: QuizQuestion; questionDate: string }>> =
    {};

  for (const wq of data) {
    const day = wq.day_of_week;
    if (!questionsByDay[day]) {
      questionsByDay[day] = [];
    }
    questionsByDay[day].push({
      question: wq.quiz_questions as unknown as QuizQuestion,
      questionDate: wq.question_date,
    });
  }

  return questionsByDay;
}

/**
 * Check if user has answered today's question
 */
export async function hasAnsweredToday(fid: number, weekId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc("has_answered_today", {
    user_fid: fid,
    week_uuid: weekId,
  });

  if (error) {
    console.error("[Quiz DB] Error checking if answered today:", error);
    return false;
  }

  return data || false;
}

/**
 * Check if a question date has expired (past today)
 */
export async function isQuestionExpired(questionDate: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc("is_question_expired", {
    question_date_param: questionDate,
  });

  if (error) {
    console.error("[Quiz DB] Error checking if question expired:", error);
    return true; // Fail safe - treat as expired
  }

  return data || false;
}

/**
 * Save user's answer for today
 */
export async function saveDailyAnswer(
  fid: number,
  username: string,
  weekId: string,
  questionId: string,
  dayOfWeek: number,
  userAnswer: string,
  correctAnswer: string
): Promise<boolean> {
  const supabase = getSupabase();

  const isCorrect = userAnswer === correctAnswer;

  const { error } = await supabase.from("user_daily_answers").insert({
    fid,
    username,
    week_id: weekId,
    question_id: questionId,
    day_of_week: dayOfWeek,
    user_answer: userAnswer,
    is_correct: isCorrect,
  });

  if (error) {
    console.error("[Quiz DB] Error saving daily answer:", error);
    return false;
  }

  return true;
}

/**
 * Get user's progress for the current week
 */
export async function getUserWeekProgress(
  fid: number,
  weekId: string
): Promise<{
  answersCount: number;
  correctCount: number;
  daysAnswered: number[];
}> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("user_daily_answers")
    .select("day_of_week, is_correct")
    .eq("fid", fid)
    .eq("week_id", weekId);

  if (error) {
    console.error("[Quiz DB] Error getting user week progress:", error);
    return { answersCount: 0, correctCount: 0, daysAnswered: [] };
  }

  const answersCount = data?.length || 0;
  const correctCount = data?.filter((a) => a.is_correct).length || 0;
  const daysAnswered = data?.map((a) => a.day_of_week) || [];

  return { answersCount, correctCount, daysAnswered };
}

/**
 * Finalize user's week (call this after Sunday or when viewing results)
 */
export async function finalizeUserWeek(fid: number, weekId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase.rpc("finalize_user_week", {
    user_fid: fid,
    week_uuid: weekId,
  });

  if (error) {
    console.error("[Quiz DB] Error finalizing user week:", error);
    return false;
  }

  return true;
}

/**
 * Get user's week summary (if finalized)
 */
export async function getUserWeekSummary(
  fid: number,
  weekId: string
): Promise<{
  score: number;
  percentage: number;
  completedAt: string;
  walletAddress?: string;
} | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("user_week_summary")
    .select("score, percentage, completed_at, wallet_address")
    .eq("fid", fid)
    .eq("week_id", weekId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Quiz DB] Error getting user week summary:", error);
    return null;
  }

  if (!data) return null;

  return {
    score: data.score,
    percentage: data.percentage,
    completedAt: data.completed_at,
    walletAddress: data.wallet_address,
  };
}

/**
 * Update user's wallet address (for rewards)
 */
export async function updateUserWallet(
  fid: number,
  weekId: string,
  walletAddress: string
): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("user_week_summary")
    .update({
      wallet_address: walletAddress,
      wallet_verified_at: new Date().toISOString(),
    })
    .eq("fid", fid)
    .eq("week_id", weekId);

  if (error) {
    console.error("[Quiz DB] Error updating wallet:", error);
    return false;
  }

  return true;
}

/**
 * Get top 10 leaderboard for a specific week
 */
export async function getWeekLeaderboard(weekId: string): Promise<WeekLeaderboardEntry[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc("get_week_top_10", {
    week_uuid: weekId,
  });

  if (error) {
    console.error("[Quiz DB] Error getting week leaderboard:", error);
    return [];
  }

  return data || [];
}

/**
 * Get user's rank for a specific week
 */
export async function getUserWeekRank(fid: number, weekId: string): Promise<number | null> {
  const leaderboard = await getWeekLeaderboard(weekId);
  const userEntry = leaderboard.find((entry) => entry.fid === fid);
  return userEntry?.rank || null;
}

/**
 * Get global leaderboard (all-time)
 */
export async function getGlobalLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("user_week_summary")
    .select("fid, username, score, total_questions, percentage, completed_at");

  if (error) {
    console.error("[Quiz DB] Error getting global leaderboard:", error);
    return [];
  }

  // Group by FID and calculate stats
  const userStats = new Map<
    number,
    {
      fid: number;
      username?: string;
      weeks: number;
      totalScore: number;
      totalQuestions: number;
      lastQuizDate: string;
    }
  >();

  for (const summary of data) {
    const existing = userStats.get(summary.fid);

    if (existing) {
      existing.weeks += 1;
      existing.totalScore += summary.score;
      existing.totalQuestions += summary.total_questions;
      if (new Date(summary.completed_at) > new Date(existing.lastQuizDate)) {
        existing.lastQuizDate = summary.completed_at;
      }
    } else {
      userStats.set(summary.fid, {
        fid: summary.fid,
        username: summary.username,
        weeks: 1,
        totalScore: summary.score,
        totalQuestions: summary.total_questions,
        lastQuizDate: summary.completed_at,
      });
    }
  }

  // Convert to array and calculate averages
  const leaderboard: LeaderboardEntry[] = Array.from(userStats.values())
    .map((user) => ({
      rank: 0,
      fid: user.fid,
      username: user.username,
      weeks_participated: user.weeks,
      average_score: (user.totalScore / user.totalQuestions) * 100,
      total_correct: user.totalScore,
      total_questions_answered: user.totalQuestions,
      last_quiz_date: user.lastQuizDate,
      current_streak: 0,
    }))
    .sort((a, b) => {
      if (b.average_score !== a.average_score) {
        return b.average_score - a.average_score;
      }
      return b.weeks_participated - a.weeks_participated;
    })
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return leaderboard;
}

/**
 * Get user's global stats
 */
export async function getUserStats(fid: number): Promise<{
  weeks_participated: number;
  average_score: number;
  current_streak: number;
  best_score: number;
  global_rank: number | null;
} | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("user_week_summary")
    .select("score, percentage, completed_at, week_id")
    .eq("fid", fid);

  if (error) {
    console.error("[Quiz DB] Error getting user stats:", error);
    return null;
  }

  if (!data || data.length === 0) {
    return {
      weeks_participated: 0,
      average_score: 0,
      current_streak: 0,
      best_score: 0,
      global_rank: null,
    };
  }

  const weeks = data.length;
  const avgScore = data.reduce((sum, s) => sum + s.percentage, 0) / weeks;
  const bestScore = Math.max(...data.map((s) => s.score));

  // Get streak
  const { data: streakData } = await supabase.rpc("calculate_user_streak", {
    user_fid: fid,
  });
  const streak = streakData || 0;

  // Get rank
  const globalLeaderboard = await getGlobalLeaderboard();
  const userEntry = globalLeaderboard.find((entry) => entry.fid === fid);
  const rank = userEntry?.rank || null;

  return {
    weeks_participated: weeks,
    average_score: avgScore,
    current_streak: streak,
    best_score: bestScore,
    global_rank: rank,
  };
}

/**
 * Track frame interaction (analytics)
 */
export async function trackInteraction(interaction: FrameInteraction): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from("frame_interactions").insert({
    fid: interaction.fid,
    username: interaction.username,
    interaction_type: interaction.interaction_type,
    week_id: interaction.week_id,
    question_id: interaction.question_id,
    metadata: interaction.metadata as any,
  });

  if (error) {
    console.error("[Quiz DB] Error tracking interaction:", error);
  }
}

/**
 * Create a new quiz week with daily questions (admin function)
 * Supports 2-3 questions per day (14-21 total questions)
 */
export async function createQuizWeek(
  weekNumber: number,
  startDate: string, // Monday
  endDate: string, // Sunday
  questionsByDay: Record<number, QuizQuestion[]> // Map of day (1-7) to questions (2-3 per day)
): Promise<QuizWeek | null> {
  const supabase = getSupabase();

  // Validate we have questions for all 7 days
  for (let day = 1; day <= 7; day++) {
    if (!questionsByDay[day] || questionsByDay[day].length < 2 || questionsByDay[day].length > 3) {
      console.error(`[Quiz DB] Day ${day} must have 2-3 questions`);
      return null;
    }
  }

  // Insert week
  const { data: week, error: weekError } = await supabase
    .from("quiz_weeks")
    .insert({
      week_number: weekNumber,
      start_date: startDate,
      end_date: endDate,
      status: "upcoming",
    })
    .select()
    .single();

  if (weekError) {
    console.error("[Quiz DB] Error creating week:", weekError);
    return null;
  }

  // Flatten all questions
  const allQuestions: QuizQuestion[] = [];
  for (let day = 1; day <= 7; day++) {
    allQuestions.push(...questionsByDay[day]);
  }

  // Insert all questions
  const { data: insertedQuestions, error: questionsError } = await supabase
    .from("quiz_questions")
    .insert(
      allQuestions.map((q) => ({
        question_text: q.question_text,
        correct_answer: q.correct_answer,
        wrong_answer_1: q.wrong_answer_1,
        wrong_answer_2: q.wrong_answer_2,
        wrong_answer_3: q.wrong_answer_3,
        event_id: q.event_id,
        event_date: q.event_date,
        difficulty: q.difficulty,
        category: q.category,
        tags: q.tags,
        explanation: q.explanation,
        image_url: q.image_url,
      }))
    )
    .select();

  if (questionsError || !insertedQuestions) {
    console.error("[Quiz DB] Error inserting questions:", questionsError);
    return null;
  }

  // Link questions to week with day assignments
  const startDateObj = new Date(startDate);
  const weekQuestions: Array<{
    week_id: string;
    question_id: string;
    day_of_week: number;
    question_date: string;
  }> = [];

  let questionIndex = 0;
  for (let day = 1; day <= 7; day++) {
    const questionDate = new Date(startDateObj);
    questionDate.setDate(startDateObj.getDate() + (day - 1));

    const questionsForDay = questionsByDay[day].length;
    for (let i = 0; i < questionsForDay; i++) {
      weekQuestions.push({
        week_id: week.id,
        question_id: insertedQuestions[questionIndex].id,
        day_of_week: day,
        question_date: questionDate.toISOString().split("T")[0],
      });
      questionIndex++;
    }
  }

  const { error: linkError } = await supabase.from("week_questions").insert(weekQuestions);

  if (linkError) {
    console.error("[Quiz DB] Error linking questions to week:", linkError);
    return null;
  }

  return week;
}
