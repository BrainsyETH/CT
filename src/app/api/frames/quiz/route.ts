import { NextRequest, NextResponse } from "next/server";
import { getTodaysEvents } from "@/lib/farcaster/get-todays-events";
import {
  getCurrentWeek,
  getWeekQuestions,
  hasUserCompletedWeek,
  saveQuizAttempt,
  getUserWeekRank,
  getUserStats,
  trackInteraction,
} from "@/lib/quiz/db";
import {
  generateFrameHTML,
  parseFrameMessage,
  encodeQuizState,
  decodeQuizState,
  getFrameImageUrl,
  getFramePostUrl,
  shuffleArray,
} from "@/lib/quiz/frame-helpers";
import type { QuizFrameState, QuizAnswer } from "@/lib/types";

export const runtime = "edge";

/**
 * GET request - Initial frame load
 */
export async function GET(request: NextRequest) {
  try {
    // Get today's event for the header
    const today = new Date();
    const todaysEvents = getTodaysEvents(today);
    const randomEvent = todaysEvents[Math.floor(Math.random() * todaysEvents.length)];

    // Get current quiz week
    const currentWeek = await getCurrentWeek();

    if (!currentWeek) {
      return new NextResponse(
        generateFrameHTML({
          imageUrl: getFrameImageUrl("/api/frames/images/home?eventTitle=No active quiz"),
          buttons: [{ label: "Check Back Later", index: 1 }],
          postUrl: getFramePostUrl("/api/frames/quiz"),
        }),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Generate home screen with today's event
    const eventTitle = randomEvent?.title || "This Day in Crypto History";
    const eventDate = randomEvent?.date
      ? new Date(randomEvent.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";
    const eventImage = randomEvent?.image || "";

    const weekDates = `${new Date(currentWeek.start_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}-${new Date(currentWeek.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    const imageUrl = getFrameImageUrl(
      `/api/frames/images/home?eventTitle=${encodeURIComponent(eventTitle)}&eventDate=${encodeURIComponent(eventDate)}&eventImage=${encodeURIComponent(eventImage)}&weekNumber=${currentWeek.week_number}&weekDates=${encodeURIComponent(weekDates)}`
    );

    return new NextResponse(
      generateFrameHTML({
        imageUrl,
        buttons: [
          { label: "Start Quiz", index: 1 },
          { label: "Leaderboard", index: 2 },
          { label: "Rules", index: 3 },
          {
            label: "Full Timeline",
            index: 4,
            action: "link",
            target: "https://chainof.events",
          },
        ],
        postUrl: getFramePostUrl("/api/frames/quiz"),
      }),
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("[Frame Quiz] Error in GET:", error);
    return new NextResponse("Error loading frame", { status: 500 });
  }
}

/**
 * POST request - Handle button clicks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const frameMessage = parseFrameMessage(body);

    if (!frameMessage) {
      return new NextResponse("Invalid frame message", { status: 400 });
    }

    const { fid, username, buttonIndex, state } = frameMessage;

    // Get current week
    const currentWeek = await getCurrentWeek();

    if (!currentWeek) {
      return new NextResponse(
        generateFrameHTML({
          imageUrl: getFrameImageUrl("/api/frames/images/home?eventTitle=No active quiz"),
          buttons: [{ label: "Home", index: 1 }],
          postUrl: getFramePostUrl("/api/frames/quiz"),
        }),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // If no state, this is the home screen
    if (!state) {
      return handleHomeScreen(fid, username || "", buttonIndex, currentWeek.id);
    }

    // Decode state
    const quizState = decodeQuizState(state);

    if (!quizState) {
      return new NextResponse("Invalid quiz state", { status: 400 });
    }

    // Handle quiz flow
    return handleQuizFlow(fid, username || "", buttonIndex, quizState, currentWeek.id);
  } catch (error) {
    console.error("[Frame Quiz] Error in POST:", error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}

/**
 * Handle home screen button actions
 */
async function handleHomeScreen(
  fid: number,
  username: string,
  buttonIndex: number,
  weekId: string
) {
  // Track interaction
  await trackInteraction({
    fid,
    username,
    interaction_type: buttonIndex === 1 ? "start_quiz" : "view_home",
    week_id: weekId,
  });

  // Button 1: Start Quiz
  if (buttonIndex === 1) {
    // Check if user already completed
    const hasCompleted = await hasUserCompletedWeek(fid, weekId);

    if (hasCompleted) {
      // Show their results instead
      const userStats = await getUserStats(fid);
      const rank = await getUserWeekRank(fid, weekId);

      const imageUrl = getFrameImageUrl(
        `/api/frames/images/results?score=${userStats?.best_score || 0}&total=7&percentage=${userStats?.average_score.toFixed(1) || 0}&rank=${rank || 0}&streak=${userStats?.current_streak || 0}&avgScore=${userStats?.average_score.toFixed(1) || 0}&weekNumber=1`
      );

      return new NextResponse(
        generateFrameHTML({
          imageUrl,
          buttons: [
            { label: "Share Score", index: 1 },
            { label: "Leaderboard", index: 2 },
            { label: "Home", index: 3 },
          ],
          postUrl: getFramePostUrl("/api/frames/quiz"),
        }),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Start quiz - show first question
    const questions = await getWeekQuestions(weekId);

    if (questions.length === 0) {
      return new NextResponse("No questions available", { status: 500 });
    }

    const quizState: QuizFrameState = {
      week_id: weekId,
      question_index: 0,
      answers: [],
      started_at: new Date().toISOString(),
    };

    return showQuestion(questions[0], 0, quizState);
  }

  // Button 2: Leaderboard
  if (buttonIndex === 2) {
    await trackInteraction({
      fid,
      username,
      interaction_type: "view_leaderboard",
      week_id: weekId,
    });

    // TODO: Create leaderboard image
    const imageUrl = getFrameImageUrl("/api/frames/images/home?eventTitle=Leaderboard Coming Soon");

    return new NextResponse(
      generateFrameHTML({
        imageUrl,
        buttons: [{ label: "Back to Home", index: 1 }],
        postUrl: getFramePostUrl("/api/frames/quiz"),
      }),
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // Button 3: Rules
  if (buttonIndex === 3) {
    await trackInteraction({
      fid,
      username,
      interaction_type: "view_rules",
      week_id: weekId,
    });

    // TODO: Create rules image
    const imageUrl = getFrameImageUrl("/api/frames/images/home?eventTitle=Rules Coming Soon");

    return new NextResponse(
      generateFrameHTML({
        imageUrl,
        buttons: [{ label: "Back to Home", index: 1 }],
        postUrl: getFramePostUrl("/api/frames/quiz"),
      }),
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // Default: back to home
  return GET(new NextRequest("https://example.com/api/frames/quiz"));
}

/**
 * Handle quiz flow (answering questions)
 */
async function handleQuizFlow(
  fid: number,
  username: string,
  buttonIndex: number,
  quizState: QuizFrameState,
  weekId: string
) {
  const questions = await getWeekQuestions(weekId);

  if (questions.length === 0) {
    return new NextResponse("No questions available", { status: 500 });
  }

  const currentQuestion = questions[quizState.question_index];

  // Map button index to answer (A=1, B=2, C=3, D=4)
  const answers = [
    currentQuestion.correct_answer,
    currentQuestion.wrong_answer_1,
    currentQuestion.wrong_answer_2,
    currentQuestion.wrong_answer_3,
  ];

  // Shuffle answers consistently (use question ID as seed)
  const shuffledAnswers = shuffleArray(answers);
  const userAnswer = shuffledAnswers[buttonIndex - 1];
  const isCorrect = userAnswer === currentQuestion.correct_answer;

  // Track answer
  await trackInteraction({
    fid,
    username,
    interaction_type: "answer_question",
    week_id: weekId,
    question_id: currentQuestion.id,
    metadata: {
      correct: isCorrect,
      answer: userAnswer,
    },
  });

  // Update state with answer
  const newAnswers: string[] = [...quizState.answers, userAnswer];

  // Check if quiz is complete
  if (quizState.question_index >= questions.length - 1) {
    // Quiz complete! Save results
    const score = newAnswers.filter((ans, idx) => {
      const q = questions[idx];
      return ans === q.correct_answer;
    }).length;

    const quizAnswers: QuizAnswer[] = questions.map((q, idx) => ({
      question_id: q.id || "",
      user_answer: newAnswers[idx],
      correct: newAnswers[idx] === q.correct_answer,
    }));

    const startedAt = new Date(quizState.started_at);
    const completedAt = new Date();

    await saveQuizAttempt(fid, username, weekId, score, quizAnswers, startedAt, completedAt);

    await trackInteraction({
      fid,
      username,
      interaction_type: "complete_quiz",
      week_id: weekId,
      metadata: {
        score,
        percentage: (score / questions.length) * 100,
      },
    });

    // Show results
    const userStats = await getUserStats(fid);
    const rank = await getUserWeekRank(fid, weekId);
    const percentage = ((score / questions.length) * 100).toFixed(1);

    const imageUrl = getFrameImageUrl(
      `/api/frames/images/results?score=${score}&total=${questions.length}&percentage=${percentage}&rank=${rank || 0}&streak=${userStats?.current_streak || 0}&avgScore=${userStats?.average_score.toFixed(1) || 0}&weekNumber=1`
    );

    return new NextResponse(
      generateFrameHTML({
        imageUrl,
        buttons: [
          { label: "Share Score", index: 1 },
          { label: "Leaderboard", index: 2 },
          { label: "Home", index: 3 },
        ],
        postUrl: getFramePostUrl("/api/frames/quiz"),
        state: "", // Clear state
      }),
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // Show next question
  const nextQuestionIndex = quizState.question_index + 1;
  const nextQuestion = questions[nextQuestionIndex];

  const newState: QuizFrameState = {
    ...quizState,
    question_index: nextQuestionIndex,
    answers: newAnswers,
  };

  return showQuestion(nextQuestion, nextQuestionIndex, newState);
}

/**
 * Show a question screen
 */
function showQuestion(question: any, index: number, state: QuizFrameState) {
  // Shuffle answers
  const answers = [
    question.correct_answer,
    question.wrong_answer_1,
    question.wrong_answer_2,
    question.wrong_answer_3,
  ];

  const shuffled = shuffleArray(answers);

  const imageUrl = getFrameImageUrl(
    `/api/frames/images/question?number=${index + 1}&text=${encodeURIComponent(question.question_text)}&a1=${encodeURIComponent(shuffled[0])}&a2=${encodeURIComponent(shuffled[1])}&a3=${encodeURIComponent(shuffled[2])}&a4=${encodeURIComponent(shuffled[3])}`
  );

  return new NextResponse(
    generateFrameHTML({
      imageUrl,
      buttons: [
        { label: "A", index: 1 },
        { label: "B", index: 2 },
        { label: "C", index: 3 },
        { label: "D", index: 4 },
      ],
      postUrl: getFramePostUrl("/api/frames/quiz"),
      state: encodeQuizState(state),
    }),
    {
      headers: { "Content-Type": "text/html" },
    }
  );
}
