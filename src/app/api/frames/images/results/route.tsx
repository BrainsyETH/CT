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
      // NEO-BRUTALIST share card version
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              background: "#14b8a6",
              padding: "0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                border: "8px solid #000000",
                borderRadius: "0",
                padding: "48px",
                width: "520px",
                boxShadow: "12px 12px 0px #000000",
              }}
            >
              {/* Title */}
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "900",
                  color: "#000000",
                  marginBottom: "8px",
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                CRYPTO QUIZ
              </div>

              {/* Week */}
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#000000",
                  marginBottom: "32px",
                  textAlign: "center",
                  padding: "8px 16px",
                  background: "#fbbf24",
                  border: "4px solid #000000",
                  display: "inline-block",
                }}
              >
                WEEK {weekNumber}
              </div>

              {/* Score Display */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "32px",
                  background: "#7c3aed",
                  border: "6px solid #000000",
                  padding: "24px",
                  boxShadow: "6px 6px 0px #000000",
                }}
              >
                <div
                  style={{
                    fontSize: "80px",
                    fontWeight: "900",
                    color: "#ffffff",
                    marginBottom: "8px",
                    textShadow: "4px 4px 0px #000000",
                  }}
                >
                  {score}/{total}
                </div>
                <div
                  style={{
                    fontSize: "40px",
                    fontWeight: "900",
                    color: "#fbbf24",
                    textTransform: "uppercase",
                  }}
                >
                  {percentage}% CORRECT
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  fontSize: "36px",
                  letterSpacing: "4px",
                  marginBottom: "32px",
                  textAlign: "center",
                  padding: "16px",
                  background: "#000000",
                  color: "#14b8a6",
                }}
              >
                {progressBar}
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "32px",
                }}
              >
                {parseInt(streak) > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: "#fbbf24",
                      border: "4px solid #000000",
                      padding: "16px",
                      flex: 1,
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "4px" }}>🔥</div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "900",
                        color: "#000000",
                      }}
                    >
                      {streak}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#000000",
                        textTransform: "uppercase",
                      }}
                    >
                      Streak
                    </div>
                  </div>
                )}

                {rankNum > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: rankNum <= 10 ? "#10b981" : "#6b7280",
                      border: "4px solid #000000",
                      padding: "16px",
                      flex: 1,
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "4px" }}>{rankEmoji}</div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "900",
                        color: "#ffffff",
                      }}
                    >
                      #{rank}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#ffffff",
                        textTransform: "uppercase",
                      }}
                    >
                      Rank
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
                  background: "#000000",
                  padding: "16px",
                  border: "4px solid #000000",
                  marginTop: "auto",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "900",
                    color: "#fbbf24",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  @{username}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#14b8a6",
                    textTransform: "uppercase",
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
