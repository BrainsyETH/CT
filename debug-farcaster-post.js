#!/usr/bin/env node

/**
 * Debug script to test Farcaster posting logic
 * This simulates what the cron job should be doing
 */

// Simulate the time utilities
function getCurrentChicagoTime() {
  const now = new Date();
  const chicagoTimeString = now.toLocaleString("en-US", {
    timeZone: "America/Chicago",
  });
  return new Date(chicagoTimeString);
}

function getCurrentChicagoHour() {
  const chicagoTime = getCurrentChicagoTime();
  return chicagoTime.getHours();
}

function getCurrentChicagoDateString() {
  const chicagoTime = getCurrentChicagoTime();
  const year = chicagoTime.getFullYear();
  const month = String(chicagoTime.getMonth() + 1).padStart(2, "0");
  const day = String(chicagoTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const POSTING_SLOTS = [
  { index: 0, hour: 10, label: "10:00 AM" },
  { index: 1, hour: 13, label: "1:00 PM" },
  { index: 2, hour: 16, label: "4:00 PM" },
  { index: 3, hour: 19, label: "7:00 PM" },
  { index: 4, hour: 22, label: "10:00 PM" },
];

function getCurrentSlot() {
  const currentHour = getCurrentChicagoHour();
  return POSTING_SLOTS.find((slot) => slot.hour === currentHour) || null;
}

// Load events
const fs = require('fs');
const path = require('path');
const eventsPath = path.join(__dirname, 'src/data/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

function getTodaysEvents(dateInChicago) {
  const month = dateInChicago.getMonth() + 1;
  const day = dateInChicago.getDate();

  const matchingEvents = events.filter((event) => {
    const eventDate = new Date(event.date + "T00:00:00Z");
    const eventMonth = eventDate.getUTCMonth() + 1;
    const eventDay = eventDate.getUTCDate();
    return eventMonth === month && eventDay === day;
  });

  const sortedEvents = matchingEvents.sort((a, b) => {
    const yearA = new Date(a.date).getFullYear();
    const yearB = new Date(b.date).getFullYear();
    if (yearA !== yearB) {
      return yearB - yearA;
    }
    return a.id.localeCompare(b.id);
  });

  return sortedEvents.slice(0, 5);
}

// Run diagnostic
console.log("=== Farcaster Post Diagnostic ===\n");

const chicagoTime = getCurrentChicagoTime();
const chicagoHour = getCurrentChicagoHour();
const chicagoDate = getCurrentChicagoDateString();

console.log(`Current Chicago Time: ${chicagoTime.toLocaleString('en-US', { timeZone: 'America/Chicago' })}`);
console.log(`Current Chicago Hour: ${chicagoHour}`);
console.log(`Current Chicago Date: ${chicagoDate}\n`);

const currentSlot = getCurrentSlot();
if (currentSlot) {
  console.log(`✅ IN POSTING SLOT: ${currentSlot.label} (index ${currentSlot.index})`);
} else {
  console.log(`❌ NOT in posting slot (current hour: ${chicagoHour})`);
  console.log(`   Next slot: ${POSTING_SLOTS.find(s => s.hour > chicagoHour)?.label || POSTING_SLOTS[0].label}`);
}

console.log("\n=== Events for Today ===\n");
const todaysEvents = getTodaysEvents(chicagoTime);

if (todaysEvents.length === 0) {
  console.log("❌ NO EVENTS FOUND for today!");
} else {
  console.log(`Found ${todaysEvents.length} events for ${chicagoDate}:\n`);
  todaysEvents.forEach((event, index) => {
    const slot = POSTING_SLOTS[index];
    console.log(`Slot ${index} (${slot?.label || 'N/A'}):`);
    console.log(`  ID: ${event.id}`);
    console.log(`  Date: ${event.date}`);
    console.log(`  Title: ${event.title}`);
    console.log(`  Summary: ${event.summary.substring(0, 100)}...`);
    console.log();
  });
}

if (currentSlot && todaysEvents.length > 0) {
  const eventForSlot = todaysEvents[currentSlot.index];
  if (eventForSlot) {
    console.log("\n=== Event That Should Post Now ===\n");
    console.log(`Slot: ${currentSlot.label}`);
    console.log(`Event: ${eventForSlot.title}`);
    console.log(`Date: ${eventForSlot.date}`);
    console.log(`\nFormatted Post:`);
    const firstSentence = eventForSlot.summary.split(/[.!?]/)[0] + '.';
    console.log(firstSentence);
    console.log(`\nhttps://chainofevents.xyz/fc/${eventForSlot.id}`);
  } else {
    console.log(`\n❌ No event available for slot ${currentSlot.index}`);
  }
}

console.log("\n=== Environment Check ===\n");
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`NEYNAR_API_KEY: ${process.env.NEYNAR_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`FARCASTER_SIGNER_UUID: ${process.env.FARCASTER_SIGNER_UUID ? '✅ Set' : '❌ Not set'}`);
console.log(`CRON_SECRET: ${process.env.CRON_SECRET ? '✅ Set' : '❌ Not set (optional)'}`);
