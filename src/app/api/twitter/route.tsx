import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Helper to get first sentence from summary
function getFirstSentence(text: string): string {
  if (!text) return "";
  // Match first sentence ending with . ! or ?
  const match = text.match(/^[^.!?]+[.!?]/);
  if (match) {
    return match[0].trim();
  }
  // If no sentence ending found, return first 150 chars
  return text.length > 150 ? `${text.slice(0, 147)}...` : text;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Chain of Events";
    const date = searchParams.get("date") || "";
    const summary = searchParams.get("summary") || "";
    const imageUrl = searchParams.get("image") || "";
    const mode = searchParams.get("mode") || "timeline";
    const hasVideo = searchParams.get("hasVideo") === "true";

    const firstSentence = getFirstSentence(summary);

    // Color scheme based on mode (matching globals.css)
    const colors =
      mode === "crimeline"
        ? {
            accent: "#7c3aed", // Purple
            accentLight: "#a855f7",
            background: "#030712",
            cardBg: "#111827",
            text: "#f9fafb",
            border: "#000000",
          }
        : {
            accent: "#14b8a6", // Teal
            accentLight: "#2dd4bf",
            background: "#f9fafb",
            cardBg: "#ffffff",
            text: "#111827",
            border: "#000000",
          };

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            fontFamily: "system-ui, sans-serif",
            background: colors.background,
            position: "relative",
          }}
        >
          {/* Full-bleed background image */}
          {imageUrl && (
            <img
              src={imageUrl}
              width="1200"
              height="600"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "1200px",
                height: "600px",
                objectFit: "cover",
              }}
            />
          )}

          {/* Fallback gradient if no image */}
          {!imageUrl && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "1200px",
                height: "600px",
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
              }}
            />
          )}

          {/* Dark overlay for text readability */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1200px",
              height: "600px",
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))",
            }}
          />

          {/* Video Play Icon - Centered */}
          {hasVideo && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.7)",
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "22px solid transparent",
                  borderBottom: "22px solid transparent",
                  borderLeft: "36px solid white",
                  marginLeft: "7px",
                }}
              />
            </div>
          )}

          {/* Date Badge - Top Left Corner */}
          {date && (
            <div
              style={{
                position: "absolute",
                top: "24px",
                left: "32px",
                display: "flex",
                background: colors.accent,
                border: `5px solid ${colors.border}`,
                padding: "14px 28px",
                boxShadow: "6px 6px 0px 0px #000000",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                }}
              >
                {date}
              </span>
            </div>
          )}

          {/* Content overlay - Bottom (moved up to avoid Twitter metadata) */}
          <div
            style={{
              position: "absolute",
              bottom: "70px",
              left: "32px",
              right: "32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            {/* Title Box - dynamic width */}
            <div
              style={{
                display: "flex",
                background: colors.cardBg,
                border: `5px solid ${colors.border}`,
                padding: "20px 32px",
                boxShadow: "8px 8px 0px 0px #000000",
              }}
            >
              <span
                style={{
                  fontSize: title.length > 50 ? "34px" : "42px",
                  fontWeight: 900,
                  color: colors.text,
                  lineHeight: 1.15,
                }}
              >
                {title}
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 600,
      }
    );
  } catch (error) {
    console.error("Error generating Twitter image:", error);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#14b8a6",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#ffffff",
              border: "8px solid #111827",
              padding: "40px 60px",
              boxShadow: "12px 12px 0px 0px #111827",
            }}
          >
            <span
              style={{
                fontSize: "56px",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              Chain of Events
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 600,
      }
    );
  }
}
