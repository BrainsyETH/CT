import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventTitle = searchParams.get("eventTitle") || "This Day in Crypto History";
    const eventDate = searchParams.get("eventDate") || "";
    const eventImage = searchParams.get("eventImage") || "";
    const weekNumber = searchParams.get("weekNumber") || "1";
    const weekDates = searchParams.get("weekDates") || "";

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
          {/* Header - Today's Event */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#111827",
              border: "4px solid #000000",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  marginRight: "12px",
                }}
              >
                📅
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#9ca3af",
                  fontWeight: "600",
                }}
              >
                This Day in Crypto History
              </div>
            </div>

            {eventImage && (
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "3px solid #000000",
                  marginBottom: "16px",
                  display: "flex",
                }}
              >
                <img
                  src={eventImage}
                  width={600}
                  height={200}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#f9fafb",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              {eventTitle}
            </div>

            {eventDate && (
              <div
                style={{
                  fontSize: "18px",
                  color: "#14b8a6",
                  fontWeight: "600",
                }}
              >
                {eventDate}
              </div>
            )}
          </div>

          {/* Quiz Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#7c3aed",
              border: "4px solid #000000",
              borderRadius: "12px",
              padding: "32px",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div style={{ fontSize: "32px", marginRight: "12px" }}>🎯</div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff" }}>
                Weekly Crypto Quiz
              </div>
            </div>

            <div
              style={{
                fontSize: "20px",
                color: "#e9d5ff",
                marginBottom: "8px",
              }}
            >
              Week {weekNumber}
              {weekDates && ` • ${weekDates}`}
            </div>

            <div
              style={{
                fontSize: "22px",
                color: "#ffffff",
                marginBottom: "20px",
                lineHeight: 1.3,
              }}
            >
              Test your crypto history knowledge!
              <br />7 questions • Top 10 win $EVENT
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#ffffff",
                border: "3px solid #000000",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "24px", marginRight: "12px" }}>🏆</div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>
                Top 10 players win $EVENT tokens
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
    console.error("[Frame Image] Error generating home image:", error);

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
