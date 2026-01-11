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

  const isCrimeline = event.mode.includes("crimeline") && event.crimeline;
  const firstSentence = getFirstSentence(event.summary);

  // Fetch event image or use fallback
  const imageUrl = event.image || (isCrimeline ? FALLBACK_IMAGE_CRIMELINE : FALLBACK_IMAGE_TIMELINE);
  let imageData: string | null = null;
  try {
    const imageResponse = await fetch(imageUrl);
    if (imageResponse.ok) {
      const buffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const contentType = imageResponse.headers.get("content-type") || "image/png";
      imageData = `data:${contentType};base64,${base64}`;
    }
  } catch (error) {
    console.error("Failed to fetch image:", error);
  }

  // Fetch logo
  let logoData: string | null = null;
  try {
    const logoResponse = await fetch(LOGO_URL);
    if (logoResponse.ok) {
      const buffer = await logoResponse.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const contentType = logoResponse.headers.get("content-type") || "image/png";
      logoData = `data:${contentType};base64,${base64}`;
    }
  } catch (error) {
    console.error("Failed to fetch logo:", error);
  }

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
            position: "relative",
            border: "8px solid black",
            background: bgColor,
            boxShadow: "16px 16px 0px 0px rgba(0,0,0,1)",
          }}
        >
          {/* Image Container - Full Display */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              background: "black",
              display: "flex",
            }}
          >
            {/* Event Image */}
            {imageData && (
              <img
                src={imageData}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            )}

            {/* Chain of Events Logo - Top Left */}
            {logoData && (
              <div
                style={{
                  position: "absolute",
                  top: "32px",
                  left: "32px",
                  width: "128px",
                  height: "128px",
                  background: "white",
                  border: "8px solid black",
                  padding: "12px",
                  transform: "rotate(-5deg)",
                  display: "flex",
                  zIndex: 20,
                }}
              >
                <img
                  src={logoData}
                  alt="Chain of Events"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            {/* First Sentence Overlay - Creative Positioning */}
            <div
              style={{
                position: "absolute",
                bottom: "64px",
                right: "48px",
                maxWidth: "75%",
                background: "white",
                border: "8px solid black",
                padding: "32px",
                transform: "rotate(2deg)",
                boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)",
                display: "flex",
                zIndex: 20,
              }}
            >
              <p
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  color: "black",
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                {firstSentence}
              </p>
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
                background: bgColor,
                boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
                display: "flex",
                zIndex: 20,
              }}
            >
              <time
                style={{
                  fontSize: "48px",
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

            {/* Site branding - Bottom Left */}
            <div
              style={{
                position: "absolute",
                bottom: "32px",
                left: "32px",
                background: "white",
                border: "4px solid black",
                padding: "12px 24px",
                transform: "rotate(-2deg)",
                boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
                display: "flex",
                zIndex: 20,
              }}
            >
              <p
                style={{
                  fontSize: "28px",
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
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
