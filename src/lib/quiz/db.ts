import { getSupabase } from "@/lib/supabase";
import type {
  QuizWeek,
  QuizQuestion,
  UserQuizAttempt,
  WeekLeaderboardEntry,
  LeaderboardEntry,
  QuizAnswer,
  FrameInteraction,
  WeekQuestion,
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

  const { data, error } = await supabase
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
 * Get questions for a specific week (ordered)
 */
export async function getWeekQuestions(weekId: string): Promise<QuizQuestion[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("week_questions")
    .select(
      `
      question_order,
      quiz_questions (*)
    `
    )
    .eq("week_id", weekId)
    .order("question_order", { ascending: true });

  if (error) {
    console.error("[Quiz DB] Error getting week questions:", error);
    return [];
  }

  // Extract questions from the join
  return data.map((wq: any) => wq.quiz_questions) as QuizQuestion[];
}

/**
 * Check if user has already completed quiz for this week
 */
export async function hasUserCompletedWeek(fid: number, weekId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("user_quiz_attempts")
    .select("id")
    .eq("fid", fid)
    .eq("week_id", weekId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned (expected if not completed)
    console.error("[Quiz DB] Error checking user completion:", error);
    return false;
  }

  return !!data;
}

/**
 * Get user's attempt for a specific week
 */
export async function getUserAttempt(
  fid: number,
  weekId: string
): Promise<UserQuizAttempt | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("user_quiz_attempts")
    .select("*")
    .eq("fid", fid)
    .eq("week_id", weekId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Quiz DB] Error getting user attempt:", error);
    return null;
  }

  return data;
}

/**
 * Save a quiz attempt
 */
export async function saveQuizAttempt(
  fid: number,
  username: string,
  weekId: string,
  score: number,
  answers: QuizAnswer[],
  startedAt: Date,
  completedAt: Date
): Promise<UserQuizAttempt | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("user_quiz_attempts")
    .insert({
      fid,
      username,
      week_id: weekId,
      score,
      total_questions: 7,
      started_at: startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      answers: answers as any,
    })
    .select()
    .single();

  if (error) {
    console.error("[Quiz DB] Error saving quiz attempt:", error);
    return null;
  }

  return data;
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
 * Get global leaderboard (all-time)
 */
export async function getGlobalLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
  const supabase = getSupabase();

  // For now, calculate manually (can be optimized with materialized view)
  const { data, error } = await supabase
    .from("user_quiz_attempts")
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

  for (const attempt of data) {
    const existing = userStats.get(attempt.fid);

    if (existing) {
      existing.weeks += 1;
      existing.totalScore += attempt.score;
      existing.totalQuestions += attempt.total_questions;
      if (new Date(attempt.completed_at) > new Date(existing.lastQuizDate)) {
        existing.lastQuizDate = attempt.completed_at;
      }
    } else {
      userStats.set(attempt.fid, {
        fid: attempt.fid,
        username: attempt.username,
        weeks: 1,
        totalScore: attempt.score,
        totalQuestions: attempt.total_questions,
        lastQuizDate: attempt.completed_at,
      });
    }
  }

  // Convert to array and calculate averages
  const leaderboard: LeaderboardEntry[] = Array.from(userStats.values())
    .map((user) => ({
      rank: 0, // Will be set after sorting
      fid: user.fid,
      username: user.username,
      weeks_participated: user.weeks,
      average_score: (user.totalScore / user.totalQuestions) * 100,
      total_correct: user.totalScore,
      total_questions_answered: user.totalQuestions,
      last_quiz_date: user.lastQuizDate,
      current_streak: 0, // TODO: Calculate streak
    }))
    .sort((a, b) => {
      // Sort by average score, then by weeks participated
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
 * Get user's rank for a specific week
 */
export async function getUserWeekRank(fid: number, weekId: string): Promise<number | null> {
  const leaderboard = await getWeekLeaderboard(weekId);
  const userEntry = leaderboard.find((entry) => entry.fid === fid);
  return userEntry?.rank || null;
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
    .from("user_quiz_attempts")
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
  const avgScore = data.reduce((sum, a) => sum + a.percentage, 0) / weeks;
  const bestScore = Math.max(...data.map((a) => a.score));

  // Calculate streak (simple version - can be enhanced)
  const streak = 0; // TODO: Implement streak calculation

  // Get rank from global leaderboard
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
 * Create a new quiz week (admin function)
 */
export async function createQuizWeek(
  weekNumber: number,
  startDate: string,
  endDate: string,
  questions: QuizQuestion[]
): Promise<QuizWeek | null> {
  const supabase = getSupabase();

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

  // Insert questions
  const { error: questionsError } = await supabase.from("quiz_questions").insert(
    questions.map((q) => ({
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
  );

  if (questionsError) {
    console.error("[Quiz DB] Error inserting questions:", questionsError);
    return null;
  }

  // Link questions to week
  const { data: insertedQuestions } = await supabase
    .from("quiz_questions")
    .select("id")
    .in(
      "question_text",
      questions.map((q) => q.question_text)
    )
    .order("created_at", { ascending: false })
    .limit(7);

  if (insertedQuestions) {
    const weekQuestions = insertedQuestions.map((q, index) => ({
      week_id: week.id,
      question_id: q.id,
      question_order: index + 1,
    }));

    await supabase.from("week_questions").insert(weekQuestions);
  }

  return week;
}
