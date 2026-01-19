import { NextRequest, NextResponse } from "next/server";
import { getTodaysEvents } from "@/lib/farcaster/get-todays-events";
import {
  getCurrentWeek,
  getOrAssignTodaysQuestion,
  hasAnsweredToday,
  saveDailyAnswer,
  getUserWeekProgress,
  getUserWeekSummary,
  finalizeUserWeek,
  getUserWeekRank,
  getUserStats,
  trackInteraction,
} from "@/lib/quiz/db";
import {
  generateFrameHTML,
  parseFrameMessage,
  getFrameImageUrl,
  getFramePostUrl,
  shuffleArray,
} from "@/lib/quiz/frame-helpers";

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
          imageUrl: getFrameImageUrl(
            "/api/frames/images/home?eventTitle=Quiz starts soon!&weekNumber=0"
          ),
          buttons: [
            { label: "Check Back Later", index: 1 },
            {
              label: "Full Timeline",
              index: 2,
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
    })}-${new Date(currentWeek.end_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;

    const imageUrl = getFrameImageUrl(
      `/api/frames/images/home?eventTitle=${encodeURIComponent(eventTitle)}&eventDate=${encodeURIComponent(eventDate)}&eventImage=${encodeURIComponent(eventImage)}&weekNumber=${currentWeek.week_number}&weekDates=${encodeURIComponent(weekDates)}`
    );

    return new NextResponse(
      generateFrameHTML({
        imageUrl,
        buttons: [
          { label: "Today's Question", index: 1 },
          { label: "My Progress", index: 2 },
          { label: "Leaderboard", index: 3 },
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

    // Parse state to determine flow
    const stateData = JSON.parse(state);

    if (stateData.action === "answer") {
      // User clicked an answer button
      return handleAnswer(
        fid,
        username || "",
        buttonIndex,
        stateData.questionId,
        stateData.answers,
        currentWeek.id
      );
    }

    // Default: back to home
    return GET(new NextRequest("https://example.com/api/frames/quiz"));
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
  // Button 1: Today's Question
  if (buttonIndex === 1) {
    await trackInteraction({
      fid,
      username,
      interaction_type: "view_daily_question",
      week_id: weekId,
    });

    // Check if user already answered today
    const alreadyAnswered = await hasAnsweredToday(fid, weekId);

    if (alreadyAnswered) {
      // Show "come back tomorrow" screen
      const progress = await getUserWeekProgress(fid, weekId);
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const daysCompleted = progress.daysAnswered.map((d) => days[d - 1]).join(", ");

      const imageUrl = getFrameImageUrl(
        `/api/frames/images/progress?answered=${progress.answersCount}&correct=${progress.correctCount}&days=${encodeURIComponent(daysCompleted)}`
      );

      return new NextResponse(
        generateFrameHTML({
          imageUrl,
          buttons: [
            { label: "Check Leaderboard", index: 1 },
            { label: "Home", index: 2 },
          ],
          postUrl: getFramePostUrl("/api/frames/quiz"),
          state: JSON.stringify({ action: "home" }),
        }),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Get or assign today's question (random from pool)
    const question = await getOrAssignTodaysQuestion(fid, weekId);

    if (!question) {
      return new NextResponse(
        generateFrameHTML({
          imageUrl: getFrameImageUrl("/api/frames/images/home?eventTitle=No question today"),
          buttons: [{ label: "Home", index: 1 }],
          postUrl: getFramePostUrl("/api/frames/quiz"),
        }),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Get user progress to show X/7
    const progress = await getUserWeekProgress(fid, weekId);
    const questionNumber = progress.answersCount + 1;

    // Show question
    return showQuestion(question, questionNumber, fid, weekId);
  }

  // Button 2: My Progress
  if (buttonIndex === 2) {
    await trackInteraction({
      fid,
      username,
      interaction_type: "view_week_results",
      week_id: weekId,
    });

    const progress = await getUserWeekProgress(fid, weekId);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const daysCompleted = progress.daysAnswered.map((d) => days[d - 1]).join(", ");

    // Check if week is complete
    if (progress.answersCount === 7) {
      // Finalize if not already done
      await finalizeUserWeek(fid, weekId);
      const summary = await getUserWeekSummary(fid, weekId);
      const rank = await getUserWeekRank(fid, weekId);
      const stats = await getUserStats(fid);

      const imageUrl = getFrameImageUrl(
        `/api/frames/images/results?score=${summary?.score || 0}&total=7&percentage=${summary?.percentage.toFixed(1) || 0}&rank=${rank || 0}&streak=${stats?.current_streak || 0}&avgScore=${stats?.average_score.toFixed(1) || 0}&weekNumber=${1}`
      );

      return new NextResponse(
        generateFrameHTML({
          imageUrl,
          buttons: [
            { label: "Share Score", index: 1 },
            { label: "Connect Wallet", index: 2 },
            { label: "Leaderboard", index: 3 },
            { label: "Home", index: 4 },
          ],
          postUrl: getFramePostUrl("/api/frames/quiz"),
          state: JSON.stringify({ action: "results" }),
        }),
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Show progress
    const imageUrl = getFrameImageUrl(
      `/api/frames/images/progress?answered=${progress.answersCount}&correct=${progress.correctCount}&days=${encodeURIComponent(daysCompleted)}`
    );

    return new NextResponse(
      generateFrameHTML({
        imageUrl,
        buttons: [
          { label: "Today's Question", index: 1 },
          { label: "Leaderboard", index: 2 },
          { label: "Home", index: 3 },
        ],
        postUrl: getFramePostUrl("/api/frames/quiz"),
        state: JSON.stringify({ action: "progress" }),
      }),
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // Button 3: Leaderboard
  if (buttonIndex === 3) {
    await trackInteraction({
      fid,
      username,
      interaction_type: "view_leaderboard",
      week_id: weekId,
    });

    // TODO: Create leaderboard image
    const imageUrl = getFrameImageUrl(
      "/api/frames/images/home?eventTitle=Leaderboard Coming Soon"
    );

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
 * Handle answer submission
 */
async function handleAnswer(
  fid: number,
  username: string,
  buttonIndex: number,
  questionId: string,
  answers: string[],
  weekId: string
) {
  // Map button index to answer
  const userAnswer = answers[buttonIndex - 1];

  // Get the question to check correct answer
  const question = await getOrAssignTodaysQuestion(fid, weekId);

  if (!question) {
    return new NextResponse("Question not found", { status: 404 });
  }

  const isCorrect = userAnswer === question.correct_answer;

  // Get current day of week (1-7, Monday = 1)
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7

  // Save answer
  await saveDailyAnswer(fid, username, weekId, questionId, dayOfWeek, userAnswer, question.correct_answer);

  await trackInteraction({
    fid,
    username,
    interaction_type: "answer_question",
    week_id: weekId,
    question_id: questionId,
    metadata: {
      correct: isCorrect,
      answer: userAnswer,
    },
  });

  // Get updated progress
  const progress = await getUserWeekProgress(fid, weekId);

  // Show result screen
  const imageUrl = getFrameImageUrl(
    `/api/frames/images/answer-result?correct=${isCorrect}&score=${progress.correctCount}&total=${progress.answersCount}&explanation=${encodeURIComponent(question.explanation || "")}`
  );

  const buttons: Array<{ label: string; index: number; action?: string; target?: string }> = [];

  if (progress.answersCount === 7) {
    // Week complete!
    await finalizeUserWeek(fid, weekId);
    buttons.push(
      { label: "View Results", index: 1 },
      { label: "Share Score", index: 2 },
      { label: "Leaderboard", index: 3 }
    );
  } else {
    buttons.push(
      { label: "Come Back Tomorrow!", index: 1 },
      { label: "View Progress", index: 2 },
      { label: "Home", index: 3 }
    );
  }

  return new NextResponse(
    generateFrameHTML({
      imageUrl,
      buttons,
      postUrl: getFramePostUrl("/api/frames/quiz"),
      state: JSON.stringify({ action: progress.answersCount === 7 ? "complete" : "answered" }),
    }),
    {
      headers: { "Content-Type": "text/html" },
    }
  );
}

/**
 * Show a question screen
 */
function showQuestion(question: any, questionNumber: number, fid: number, weekId: string) {
  // Shuffle answers
  const answers = [
    question.correct_answer,
    question.wrong_answer_1,
    question.wrong_answer_2,
    question.wrong_answer_3,
  ];

  const shuffled = shuffleArray(answers);

  const imageUrl = getFrameImageUrl(
    `/api/frames/images/question?number=${questionNumber}&text=${encodeURIComponent(question.question_text)}&a1=${encodeURIComponent(shuffled[0])}&a2=${encodeURIComponent(shuffled[1])}&a3=${encodeURIComponent(shuffled[2])}&a4=${encodeURIComponent(shuffled[3])}`
  );

  // State includes question ID and shuffled answers for validation
  const state = JSON.stringify({
    action: "answer",
    questionId: question.id,
    answers: shuffled,
  });

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
      state,
    }),
    {
      headers: { "Content-Type": "text/html" },
    }
  );
}
