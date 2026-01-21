import React from "react";
import { AbsoluteFill } from "remotion";

export const Promo16x9: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f9fafb",
        color: "#111827",
        justifyContent: "center",
        alignItems: "center",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: "-0.02em" }}>
          Chain of Events
        </div>
        <div style={{ marginTop: 16, fontSize: 22, opacity: 0.85 }}>
          The history of cryptocurrency
        </div>
      </div>
    </AbsoluteFill>
  );
};

