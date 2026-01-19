import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionNumber = searchParams.get("number") || "1";
    const questionText = searchParams.get("text") || "Sample question?";
    const answer1 = searchParams.get("a1") || "Option 1";
    const answer2 = searchParams.get("a2") || "Option 2";
    const answer3 = searchParams.get("a3") || "Option 3";
    const answer4 = searchParams.get("a4") || "Option 4";

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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#14b8a6",
              }}
            >
              Question {questionNumber}/7
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#9ca3af",
              }}
            >
              🎯 Crypto History Quiz
            </div>
          </div>

          {/* Question */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#111827",
              border: "4px solid #000000",
              borderRadius: "12px",
              padding: "32px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#f9fafb",
                lineHeight: 1.3,
              }}
            >
              {questionText}
            </div>
          </div>

          {/* Answers Grid */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              flex: 1,
            }}
          >
            {/* Answer 1 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#1f2937",
                border: "3px solid #14b8a6",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#14b8a6",
                  color: "#000000",
                  fontSize: "20px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "16px",
                }}
              >
                A
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#f9fafb",
                  fontWeight: "600",
                }}
              >
                {answer1}
              </div>
            </div>

            {/* Answer 2 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#1f2937",
                border: "3px solid #3b82f6",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#3b82f6",
                  color: "#000000",
                  fontSize: "20px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "16px",
                }}
              >
                B
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#f9fafb",
                  fontWeight: "600",
                }}
              >
                {answer2}
              </div>
            </div>

            {/* Answer 3 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#1f2937",
                border: "3px solid #f59e0b",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#f59e0b",
                  color: "#000000",
                  fontSize: "20px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "16px",
                }}
              >
                C
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#f9fafb",
                  fontWeight: "600",
                }}
              >
                {answer3}
              </div>
            </div>

            {/* Answer 4 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#1f2937",
                border: "3px solid #a855f7",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#a855f7",
                  color: "#000000",
                  fontSize: "20px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "16px",
                }}
              >
                D
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#f9fafb",
                  fontWeight: "600",
                }}
              >
                {answer4}
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
  } catch (error) {
    console.error("[Frame Image] Error generating question image:", error);

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
