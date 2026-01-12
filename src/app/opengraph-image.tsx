import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Chain of Events - The History of Cryptocurrency";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Timeline line */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "15%",
            bottom: "15%",
            width: "4px",
            background: "linear-gradient(180deg, #14b8a6 0%, #dc2626 100%)",
            borderRadius: "2px",
          }}
        />

        {/* Timeline dots */}
        <div
          style={{
            position: "absolute",
            left: "calc(50% - 10px)",
            top: "20%",
            width: "24px",
            height: "24px",
            borderRadius: "12px",
            backgroundColor: "#14b8a6",
            boxShadow: "0 0 20px rgba(20, 184, 166, 0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "calc(50% - 10px)",
            top: "50%",
            width: "24px",
            height: "24px",
            borderRadius: "12px",
            backgroundColor: "#eab308",
            boxShadow: "0 0 20px rgba(234, 179, 8, 0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "calc(50% - 10px)",
            top: "80%",
            width: "24px",
            height: "24px",
            borderRadius: "12px",
            backgroundColor: "#dc2626",
            boxShadow: "0 0 20px rgba(220, 38, 38, 0.6)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
              marginBottom: "24px",
              fontSize: "40px",
            }}
          >
            ₿
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "white",
              margin: 0,
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            Chain of Events
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "28px",
              color: "#94a3b8",
              margin: 0,
              marginBottom: "32px",
              textAlign: "center",
            }}
          >
            The History of Cryptocurrency
          </p>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                borderRadius: "9999px",
                backgroundColor: "rgba(20, 184, 166, 0.2)",
                border: "1px solid rgba(20, 184, 166, 0.5)",
                color: "#5eead4",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              Timeline Mode
            </div>
            <div
              style={{
                padding: "8px 16px",
                borderRadius: "9999px",
                backgroundColor: "rgba(220, 38, 38, 0.2)",
                border: "1px solid rgba(220, 38, 38, 0.5)",
                color: "#fca5a5",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              Crimeline Mode
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#64748b",
            fontSize: "18px",
          }}
        >
          <span>Milestones</span>
          <span>•</span>
          <span>Hacks</span>
          <span>•</span>
          <span>Exploits</span>
          <span>•</span>
          <span>History</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
