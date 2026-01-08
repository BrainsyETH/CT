import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import eventsData from "@/data/events.json";
import type { Event } from "@/lib/types";

const events = eventsData as Event[];

export const runtime = "edge";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("id");

  const event = events.find((e) => e.id === eventId);

  // Fetch event image if available
  let imageData: string | null = null;
  if (event?.image) {
    try {
      const imageResponse = await fetch(event.image);
      if (imageResponse.ok) {
        const buffer = await imageResponse.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
        imageData = `data:${contentType};base64,${base64}`;
      }
    } catch (error) {
      console.error("Failed to fetch event image:", error);
    }
  }

  if (!event) {
    // Return default OG image if event not found
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
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ color: "white", fontSize: 48 }}>Crypto Timeline</h1>
          <p style={{ color: "#94a3b8", fontSize: 24 }}>Event not found</p>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const isCrimeline = event.mode.includes("crimeline") && event.crimeline;
  const bgGradient = isCrimeline
    ? "linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)"
    : "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)";
  const accentColor = isCrimeline ? "#dc2626" : "#14b8a6";
  const accentBg = isCrimeline ? "rgba(220, 38, 38, 0.2)" : "rgba(20, 184, 166, 0.2)";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: bgGradient,
          fontFamily: "system-ui, sans-serif",
          padding: "48px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "white",
              }}
            >
              {isCrimeline ? "💀" : "₿"}
            </div>
            <span style={{ color: "#94a3b8", fontSize: "24px", fontWeight: 600 }}>
              {isCrimeline ? "Crypto Crimeline" : "Crypto Timeline"}
            </span>
          </div>
          <div
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              background: accentBg,
              border: `2px solid ${accentColor}`,
              color: accentColor,
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            {formatDate(event.date)}
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            background: isCrimeline ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.05)",
            borderRadius: "24px",
            overflow: "hidden",
            border: `2px solid ${isCrimeline ? "rgba(220,38,38,0.3)" : "rgba(20,184,166,0.3)"}`,
          }}
        >
          {/* Event Image */}
          {imageData && (
            <div
              style={{
                width: "380px",
                display: "flex",
                position: "relative",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageData}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: isCrimeline
                    ? "linear-gradient(to right, transparent 60%, rgba(0,0,0,0.8) 100%)"
                    : "linear-gradient(to right, transparent 60%, rgba(15,23,42,0.8) 100%)",
                }}
              />
            </div>
          )}

          {/* Content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "40px",
            }}
          >
            {/* Title */}
            <h1
              style={{
                fontSize: imageData ? "42px" : "56px",
                fontWeight: "bold",
                color: "white",
                margin: 0,
                marginBottom: "12px",
                lineHeight: 1.2,
              }}
            >
              {event.title}
            </h1>

            {/* Summary */}
            <p
              style={{
                fontSize: imageData ? "22px" : "28px",
                color: "#94a3b8",
                margin: 0,
                marginBottom: "24px",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: imageData ? 2 : 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {event.summary}
            </p>

            {/* Tags */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
              {event.tags.slice(0, imageData ? 3 : 4).map((tag: string) => (
                <div
                  key={tag}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    background: accentBg,
                    color: accentColor,
                    fontSize: imageData ? "14px" : "18px",
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>

            {/* Crimeline-specific info */}
            {isCrimeline && event.crimeline && (
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  marginTop: "auto",
                  flexWrap: "wrap",
                }}
              >
                {event.crimeline.funds_lost_usd && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#6b7280", fontSize: "14px", marginBottom: "4px" }}>
                      Funds Lost
                    </span>
                    <span style={{ color: "#dc2626", fontSize: imageData ? "28px" : "36px", fontWeight: "bold" }}>
                      {formatCurrency(event.crimeline.funds_lost_usd)}
                    </span>
                  </div>
                )}
                {event.crimeline.type && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#6b7280", fontSize: "14px", marginBottom: "4px" }}>
                      Type
                    </span>
                    <span style={{ color: "#fca5a5", fontSize: imageData ? "18px" : "24px", fontWeight: 600 }}>
                      {event.crimeline.type}
                    </span>
                  </div>
                )}
                {event.crimeline.status && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#6b7280", fontSize: "14px", marginBottom: "4px" }}>
                      Status
                    </span>
                    <span
                      style={{
                        color:
                          event.crimeline.status === "Funds recovered"
                            ? "#4ade80"
                            : event.crimeline.status === "Total loss"
                            ? "#f87171"
                            : "#fbbf24",
                        fontSize: imageData ? "18px" : "24px",
                        fontWeight: 600,
                      }}
                    >
                      {event.crimeline.status}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Timeline-specific metrics */}
            {!isCrimeline && event.metrics && (
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  marginTop: "auto",
                }}
              >
                {event.metrics.btc_price_usd !== undefined && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#6b7280", fontSize: "14px", marginBottom: "4px" }}>
                      BTC Price
                    </span>
                    <span style={{ color: "#5eead4", fontSize: imageData ? "24px" : "32px", fontWeight: "bold" }}>
                      {formatCurrency(event.metrics.btc_price_usd)}
                    </span>
                  </div>
                )}
                {event.metrics.market_cap_usd !== undefined && (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#6b7280", fontSize: "14px", marginBottom: "4px" }}>
                      Market Cap
                    </span>
                    <span style={{ color: "#5eead4", fontSize: imageData ? "24px" : "32px", fontWeight: "bold" }}>
                      {formatCurrency(event.metrics.market_cap_usd)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
