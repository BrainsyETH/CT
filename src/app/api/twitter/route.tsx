import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Chain of Events";
    const date = searchParams.get("date") || "";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#fde047",
            fontFamily: "system-ui, sans-serif",
            padding: "48px",
          }}
        >
          {/* Date Badge */}
          {date && (
            <div
              style={{
                background: "white",
                border: "8px solid black",
                padding: "12px 24px",
                marginBottom: "32px",
                boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  color: "black",
                  textTransform: "uppercase",
                }}
              >
                {date}
              </div>
            </div>
          )}

          {/* Title Box */}
          <div
            style={{
              background: "white",
              border: "8px solid black",
              padding: "36px 56px",
              maxWidth: "900px",
              boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)",
            }}
          >
            <div
              style={{
                fontSize: "46px",
                fontWeight: 900,
                color: "black",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
          </div>

          {/* Site Branding */}
          <div
            style={{
              background: "black",
              border: "4px solid black",
              padding: "12px 32px",
              marginTop: "28px",
              boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 900,
                color: "white",
                textTransform: "uppercase",
              }}
            >
              chainofevents.xyz
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
            background: "#fde047",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 900,
              color: "black",
            }}
          >
            Chain of Events
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
