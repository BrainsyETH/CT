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

    const firstSentence = getFirstSentence(summary);

    // Color scheme based on mode (matching globals.css)
    const colors =
      mode === "crimeline"
        ? {
            accent: "#7c3aed", // Purple
            accentLight: "#a855f7",
            background: "#030712",
            cardBg: "rgba(17, 24, 39, 0.95)",
            text: "#f9fafb",
            border: "#7c3aed",
          }
        : {
            accent: "#14b8a6", // Teal
            accentLight: "#2dd4bf",
            background: "#f9fafb",
            cardBg: "rgba(255, 255, 255, 0.95)",
            text: "#111827",
            border: "#14b8a6",
          };

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            fontFamily: "Inter, system-ui, sans-serif",
            background: colors.background,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Full-bleed background image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
              }}
            />
          )}

          {/* Dark overlay gradient for text readability */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.7) 100%)",
            }}
          />

          {/* Date Badge - Top Left Corner */}
          {date && (
            <div
              style={{
                position: "absolute",
                top: "24px",
                left: "24px",
                display: "flex",
                background: colors.accent,
                border: `4px solid #000000`,
                padding: "10px 20px",
                boxShadow: "6px 6px 0px 0px #000000",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {date}
              </div>
            </div>
          )}

          {/* Content overlay - Bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              padding: "0 32px 28px 32px",
            }}
          >
            {/* Title Box */}
            <div
              style={{
                display: "flex",
                background: colors.cardBg,
                border: `5px solid #000000`,
                padding: "20px 28px",
                boxShadow: "8px 8px 0px 0px #000000",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: title.length > 50 ? "32px" : "38px",
                  fontWeight: 900,
                  color: colors.text,
                  lineHeight: 1.15,
                  letterSpacing: "-0.5px",
                }}
              >
                {title}
              </div>
            </div>

            {/* Summary and Branding Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "20px",
              }}
            >
              {/* Summary Box */}
              {firstSentence && (
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    background: colors.cardBg,
                    border: `4px solid #000000`,
                    padding: "14px 20px",
                    boxShadow: "5px 5px 0px 0px #000000",
                  }}
                >
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: colors.text,
                      lineHeight: 1.4,
                    }}
                  >
                    {firstSentence}
                  </div>
                </div>
              )}

              {/* Site Branding */}
              <div
                style={{
                  display: "flex",
                  background: "#000000",
                  border: `4px solid #000000`,
                  padding: "12px 20px",
                  boxShadow: `5px 5px 0px 0px ${colors.accent}`,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  CHAINOFEVENTS.XYZ
                </div>
              </div>
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
            <div
              style={{
                fontSize: "56px",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              Chain of Events
            </div>
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
