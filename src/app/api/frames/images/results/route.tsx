import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const score = searchParams.get("score") || "0";
    const total = searchParams.get("total") || "7";
    const percentage = searchParams.get("percentage") || "0";
    const rank = searchParams.get("rank") || "0";
    const streak = searchParams.get("streak") || "0";
    const avgScore = searchParams.get("avgScore") || "0";
    const weekNumber = searchParams.get("weekNumber") || "1";
    const isShare = searchParams.get("share") === "true";
    const username = searchParams.get("username") || "Anonymous";

    const scoreNum = parseInt(score);
    const totalNum = parseInt(total);
    const percentageNum = parseFloat(percentage);

    // Progress bar
    const barLength = 10;
    const filled = Math.round((scoreNum / totalNum) * barLength);
    const progressBar = "▓".repeat(filled) + "░".repeat(barLength - filled);

    // Rank emoji
    let rankEmoji = "📊";
    const rankNum = parseInt(rank);
    if (rankNum === 1) rankEmoji = "🥇";
    else if (rankNum === 2) rankEmoji = "🥈";
    else if (rankNum === 3) rankEmoji = "🥉";
    else if (rankNum <= 10) rankEmoji = "🏆";

    // Performance message
    let message = "Good try!";
    if (percentageNum === 100) message = "Perfect score! 🎉";
    else if (percentageNum >= 85) message = "Excellent work!";
    else if (percentageNum >= 70) message = "Well done!";
    else if (percentageNum >= 50) message = "Not bad!";

    if (isShare) {
      // Share card version (optimized for social sharing)
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              background: "linear-gradient(135deg, #7c3aed 0%, #14b8a6 100%)",
              padding: "48px",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                border: "6px solid #000000",
                borderRadius: "24px",
                padding: "48px",
                width: "100%",
                maxWidth: "500px",
              }}
            >
              {/* Title */}
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: "24px",
                  textAlign: "center",
                }}
              >
                🏆 CRYPTO HISTORY QUIZ
              </div>

              {/* Week */}
              <div
                style={{
                  fontSize: "20px",
                  color: "#6b7280",
                  marginBottom: "32px",
                  textAlign: "center",
                }}
              >
                Week {weekNumber} Results
              </div>

              {/* Score Display */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "32px",
                }}
              >
                <div
                  style={{
                    fontSize: "64px",
                    fontWeight: "700",
                    color: "#7c3aed",
                    marginBottom: "12px",
                  }}
                >
                  {score}/{total}
                </div>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "700",
                    color: "#14b8a6",
                  }}
                >
                  {percentage}% Correct
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  fontSize: "32px",
                  letterSpacing: "2px",
                  marginBottom: "32px",
                  textAlign: "center",
                }}
              >
                {progressBar}
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginBottom: "32px",
                }}
              >
                {parseInt(streak) > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔥</div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      {streak} Week Streak
                    </div>
                  </div>
                )}

                {rankNum > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{rankEmoji}</div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      Rank #{rank}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderTop: "3px solid #e5e7eb",
                  paddingTop: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  @{username}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    color: "#9ca3af",
                  }}
                >
                  chainof.events
                </div>
              </div>
            </div>
          </div>
        ),
        {
          width: 600,
          height: 600,
        }
      );
    }

    // Regular results screen
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#030712",
            padding: "40px",
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#14b8a6",
              marginBottom: "32px",
              textAlign: "center",
            }}
          >
            🎉 Quiz Complete!
          </div>

          {/* Main Results */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#111827",
              border: "4px solid #000000",
              borderRadius: "12px",
              padding: "32px",
              marginBottom: "24px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                color: "#9ca3af",
                marginBottom: "16px",
              }}
            >
              {message}
            </div>

            <div
              style={{
                fontSize: "56px",
                fontWeight: "700",
                color: "#f9fafb",
                marginBottom: "12px",
              }}
            >
              {score}/{total}
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#7c3aed",
                marginBottom: "20px",
              }}
            >
              {percentage}% Correct
            </div>

            <div
              style={{
                fontSize: "28px",
                letterSpacing: "2px",
                marginBottom: "24px",
              }}
            >
              {progressBar}
            </div>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {parseInt(streak) > 0 && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  background: "#1f2937",
                  border: "3px solid #f59e0b",
                  borderRadius: "8px",
                  padding: "20px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#f59e0b",
                    marginBottom: "8px",
                  }}
                >
                  🔥 {streak}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#9ca3af",
                  }}
                >
                  Week Streak
                </div>
              </div>
            )}

            {parseFloat(avgScore) > 0 && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  background: "#1f2937",
                  border: "3px solid #14b8a6",
                  borderRadius: "8px",
                  padding: "20px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "700",
                    color: "#14b8a6",
                    marginBottom: "8px",
                  }}
                >
                  {avgScore}%
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#9ca3af",
                  }}
                >
                  Avg Score
                </div>
              </div>
            )}
          </div>

          {/* Rank Display */}
          {rankNum > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: rankNum <= 10 ? "#7c3aed" : "#1f2937",
                border: "3px solid #000000",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginRight: "12px",
                }}
              >
                {rankEmoji}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#ffffff",
                }}
              >
                Current Rank: #{rank}
                {rankNum <= 10 && " (Prize Winner! 🎉)"}
              </div>
            </div>
          )}
        </div>
      ),
      {
        width: 600,
        height: 600,
      }
    );
  } catch (error) {
    console.error("[Frame Image] Error generating results image:", error);

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111827",
          }}
        >
          <div style={{ fontSize: "24px", color: "#ef4444" }}>Error generating image</div>
        </div>
      ),
      {
        width: 600,
        height: 600,
      }
    );
  }
}
