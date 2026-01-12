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
            accentLight: "#2e1065",
            background: "#030712",
            cardBg: "#111827",
            text: "#f9fafb",
            border: "#5b21b6",
          }
        : {
            accent: "#14b8a6", // Teal
            accentLight: "#ccfbf1",
            background: "#f9fafb",
            cardBg: "#ffffff",
            text: "#111827",
            border: "#111827",
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
          {/* Neo-brutalist decorative elements */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "200px",
              height: "200px",
              background: colors.accent,
              transform: "rotate(15deg)",
              border: `6px solid ${colors.border}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "-60px",
              width: "180px",
              height: "180px",
              background: colors.accentLight,
              transform: "rotate(-10deg)",
              border: `6px solid ${colors.border}`,
            }}
          />

          {/* Main content container */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              padding: "40px",
            }}
          >
            {/* Left side - Event Image */}
            <div
              style={{
                display: "flex",
                width: "420px",
                height: "100%",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  border: `8px solid ${colors.border}`,
                  boxShadow: `12px 12px 0px 0px ${colors.border}`,
                  background: colors.cardBg,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "120px",
                        fontWeight: 900,
                        color: colors.text,
                      }}
                    >
                      ⛓
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Content */}
            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                paddingLeft: "40px",
                justifyContent: "center",
              }}
            >
              {/* Date Badge */}
              {date && (
                <div
                  style={{
                    display: "flex",
                    alignSelf: "flex-start",
                    background: colors.accent,
                    border: `5px solid ${colors.border}`,
                    padding: "8px 20px",
                    marginBottom: "20px",
                    boxShadow: `6px 6px 0px 0px ${colors.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      color: mode === "crimeline" ? "#ffffff" : "#000000",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {date}
                  </div>
                </div>
              )}

              {/* Title Box */}
              <div
                style={{
                  display: "flex",
                  background: colors.cardBg,
                  border: `6px solid ${colors.border}`,
                  padding: "24px 28px",
                  boxShadow: `10px 10px 0px 0px ${colors.border}`,
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: title.length > 50 ? "32px" : "40px",
                    fontWeight: 900,
                    color: colors.text,
                    lineHeight: 1.15,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {title}
                </div>
              </div>

              {/* Summary Box */}
              {firstSentence && (
                <div
                  style={{
                    display: "flex",
                    background:
                      mode === "crimeline" ? colors.accentLight : "#f3f4f6",
                    border: `4px solid ${colors.border}`,
                    padding: "16px 20px",
                    boxShadow: `6px 6px 0px 0px ${colors.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: colors.text,
                      lineHeight: 1.4,
                    }}
                  >
                    {firstSentence}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Site Branding - Bottom */}
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              right: "40px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                background: colors.border,
                border: `4px solid ${colors.border}`,
                padding: "10px 24px",
                boxShadow: `4px 4px 0px 0px ${colors.accent}`,
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  color: mode === "crimeline" ? "#f9fafb" : "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                chainofevents.xyz
              </div>
            </div>
          </div>

          {/* Mode indicator badge */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              right: "40px",
              display: "flex",
              background: colors.accent,
              border: `4px solid ${colors.border}`,
              padding: "6px 16px",
              transform: "rotate(3deg)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 900,
                color: mode === "crimeline" ? "#ffffff" : "#000000",
                textTransform: "uppercase",
              }}
            >
              {mode === "crimeline" ? "CRIMELINE" : "TIMELINE"}
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
