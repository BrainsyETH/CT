import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const answered = searchParams.get("answered") || "0";
    const correct = searchParams.get("correct") || "0";
    const days = searchParams.get("days") || "";

    const answeredNum = parseInt(answered);
    const correctNum = parseInt(correct);

    // Progress bar
    const barLength = 7;
    const progressBar = "▓".repeat(answeredNum) + "░".repeat(barLength - answeredNum);

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
            📊 Your Progress This Week
          </div>

          {/* Main Progress Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#111827",
              border: "4px solid #000000",
              borderRadius: "12px",
              padding: "32px",
              marginBottom: "24px",
              flex: 1,
            }}
          >
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
                  fontSize: "20px",
                  color: "#9ca3af",
                  marginBottom: "12px",
                }}
              >
                Questions Answered
              </div>
              <div
                style={{
                  fontSize: "72px",
                  fontWeight: "700",
                  color: "#f9fafb",
                  marginBottom: "8px",
                }}
              >
                {answered}/7
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#14b8a6",
                }}
              >
                {correct} Correct
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                fontSize: "32px",
                letterSpacing: "4px",
                marginBottom: "32px",
                textAlign: "center",
              }}
            >
              {progressBar}
            </div>

            {/* Days Completed */}
            {days && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#1f2937",
                  border: "3px solid #14b8a6",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    color: "#9ca3af",
                    marginBottom: "8px",
                  }}
                >
                  Days Completed:
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#14b8a6",
                  }}
                >
                  {days}
                </div>
              </div>
            )}

            {/* Message */}
            <div
              style={{
                fontSize: "24px",
                color: "#f9fafb",
                textAlign: "center",
                marginTop: "auto",
              }}
            >
              {answeredNum === 7
                ? "🎉 Week Complete! Check your results!"
                : "⏰ Come back tomorrow for the next question!"}
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 600,
      }
    );
  } catch (error) {
    console.error("[Frame Image] Error generating progress image:", error);

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
