/**
 * Script to generate and seed quiz questions from events.json
 * Run with: npx tsx scripts/quiz/seed-questions.ts
 */

import { generateQuestionPool, selectWeeklyQuestions } from "@/lib/quiz/question-generator";
import { createQuizWeek } from "@/lib/quiz/db";

async function main() {
  console.log("🎯 Generating quiz questions from events...\n");

  // Generate a pool of 100 questions
  console.log("📝 Generating question pool...");
  const questionPool = generateQuestionPool(100);
  console.log(`✅ Generated ${questionPool.length} questions\n`);

  // Show distribution
  const easy = questionPool.filter((q) => q.difficulty === "easy").length;
  const medium = questionPool.filter((q) => q.difficulty === "medium").length;
  const hard = questionPool.filter((q) => q.difficulty === "hard").length;

  console.log("📊 Difficulty distribution:");
  console.log(`  Easy: ${easy}`);
  console.log(`  Medium: ${medium}`);
  console.log(`  Hard: ${hard}\n`);

  // Create Week 1 (example)
  console.log("📅 Creating Week 1...");

  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));

  const startDate = nextMonday.toISOString().split("T")[0];
  const endDate = new Date(nextMonday.getTime() + 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const weekQuestions = selectWeeklyQuestions(questionPool);

  console.log(`  Start: ${startDate}`);
  console.log(`  End: ${endDate}`);
  console.log(`  Questions: ${weekQuestions.length}\n`);

  console.log("📋 Selected questions:");
  weekQuestions.forEach((q, i) => {
    console.log(`  ${i + 1}. [${q.difficulty?.toUpperCase()}] ${q.question_text}`);
  });

  // Uncomment to actually create the week in the database
  /*
  const week = await createQuizWeek(1, startDate, endDate, weekQuestions);

  if (week) {
    console.log("\n✅ Week 1 created successfully!");
    console.log(`   Week ID: ${week.id}`);
  } else {
    console.error("\n❌ Failed to create week");
  }
  */

  console.log("\n✅ Done!");
  console.log("\nNext steps:");
  console.log("1. Review the questions above");
  console.log("2. Uncomment the database insert code");
  console.log("3. Run this script again to seed the database");
  console.log("4. Update week status to 'active' in Supabase dashboard");
}

main().catch(console.error);
