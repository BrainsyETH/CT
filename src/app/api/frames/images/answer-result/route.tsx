import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const correct = searchParams.get("correct") === "true";
    const score = searchParams.get("score") || "0";
    const total = searchParams.get("total") || "1";
    const explanation = searchParams.get("explanation") || "";

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
          {/* Header with result */}
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
                marginBottom: "16px",
              }}
            >
              {correct ? "✅" : "❌"}
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: "700",
                color: correct ? "#10b981" : "#ef4444",
                marginBottom: "8px",
              }}
            >
              {correct ? "Correct!" : "Incorrect"}
            </div>
            <div
              style={{
                fontSize: "24px",
                color: "#9ca3af",
              }}
            >
              Current Score: {score}/{total}
            </div>
          </div>

          {/* Explanation (if provided) */}
          {explanation && (
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
              <div
                style={{
                  fontSize: "20px",
                  color: "#9ca3af",
                  marginBottom: "16px",
                }}
              >
                💡 Explanation:
              </div>
              <div
                style={{
                  fontSize: "18px",
                  color: "#f9fafb",
                  lineHeight: 1.5,
                }}
              >
                {explanation}
              </div>
            </div>
          )}

          {/* Next steps message */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#7c3aed",
              border: "4px solid #000000",
              borderRadius: "12px",
              padding: "24px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#ffffff",
              }}
            >
              {parseInt(total) === 7
                ? "🎉 Week Complete! View your results!"
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
    console.error("[Frame Image] Error generating answer result image:", error);

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
