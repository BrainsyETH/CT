import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/types";

const events = eventsData as Event[];

export const runtime = "edge";

const FALLBACK_IMAGE_TIMELINE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/chain_of_events_small.png";
const FALLBACK_IMAGE_CRIMELINE = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/CoE_Crimeline.png";
const LOGO_URL = "https://xcxqku1c8gojqt7x.public.blob.vercel-storage.com/chain_of_events_small.png";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Extract first sentence from summary
const getFirstSentence = (text: string): string => {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : text.split(' ').slice(0, 15).join(' ') + '...';
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("id");

  const event = events.find((e) => e.id === eventId);

  if (!event) {
    // Return default neo-brutalist OG image if event not found
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fde047", // yellow-300
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              border: "8px solid black",
              padding: "60px 80px",
              boxShadow: "16px 16px 0px 0px rgba(0,0,0,1)",
              transform: "rotate(-2deg)",
            }}
          >
            <h1 style={{
              color: "black",
              fontSize: 64,
              fontWeight: 900,
              margin: 0,
              marginBottom: "16px",
              textTransform: "uppercase",
            }}>
              Chain of Events
            </h1>
            <p style={{
              color: "black",
              fontSize: 32,
              fontWeight: 700,
              margin: 0,
            }}>
              Event not found
            </p>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const isCrimeline = Array.isArray(event.mode) ? event.mode.includes("crimeline") : event.mode === "crimeline";
  const firstSentence = getFirstSentence(event.summary);
  const bgColor = isCrimeline ? "#ef4444" : "#fde047"; // red-500 or yellow-300

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Neo-Brutalist Card with thick border and bold shadow */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            border: "8px solid black",
            background: bgColor,
            boxShadow: "16px 16px 0px 0px rgba(0,0,0,1)",
            padding: "48px",
          }}
        >
          {/* Logo placeholder - Top Left */}
          <div
            style={{
              position: "absolute",
              top: "32px",
              left: "32px",
              width: "80px",
              height: "80px",
              background: "white",
              border: "6px solid black",
              padding: "12px",
              transform: "rotate(-5deg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              zIndex: 20,
            }}
          >
            {isCrimeline ? "💀" : "₿"}
          </div>

          {/* Date - Large and Prominent - Top Right */}
          <div
            style={{
              position: "absolute",
              top: "32px",
              right: "32px",
              border: "8px solid black",
              padding: "16px 32px",
              transform: "rotate(3deg)",
              background: "white",
              boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
              display: "flex",
              zIndex: 20,
            }}
          >
            <time
              style={{
                fontSize: "42px",
                fontWeight: 900,
                color: "black",
                textTransform: "uppercase",
                letterSpacing: "-0.05em",
                margin: 0,
              }}
            >
              {formatDate(event.date)}
            </time>
          </div>

          {/* Main Content - Center */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              padding: "80px 60px",
            }}
          >
            {/* Title */}
            <div
              style={{
                background: "white",
                border: "8px solid black",
                padding: "28px 40px",
                marginBottom: "28px",
                boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)",
                transform: "rotate(-1deg)",
                maxWidth: "850px",
                width: "90%",
              }}
            >
              <h1
                style={{
                  fontSize: event.title.length > 50 ? "42px" : "52px",
                  fontWeight: 900,
                  color: "black",
                  margin: 0,
                  textAlign: "center",
                  lineHeight: 1.15,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {event.title}
              </h1>
            </div>

            {/* First Sentence */}
            <div
              style={{
                background: "black",
                border: "6px solid black",
                padding: "20px 32px",
                transform: "rotate(1deg)",
                maxWidth: "750px",
                width: "85%",
                boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.3)",
              }}
            >
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.35,
                  margin: 0,
                  textAlign: "center",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {firstSentence}
              </p>
            </div>
          </div>

          {/* Site branding - Bottom */}
          <div
            style={{
              position: "absolute",
              bottom: "32px",
              left: "50%",
              transform: "translateX(-50%) rotate(-2deg)",
              background: "white",
              border: "4px solid black",
              padding: "12px 32px",
              boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
              display: "flex",
            }}
          >
            <p
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "black",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              chainofevents.xyz
            </p>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
