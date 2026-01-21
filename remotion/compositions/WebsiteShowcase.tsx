import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
  Sequence,
  Img,
  staticFile,
} from "remotion";

// Color palette matching the website
const COLORS = {
  // Timeline mode (light)
  timelineBg: "#fafafa",
  timelineText: "#111827",
  timelineAccent: "#10b981",
  timelineBorder: "#1f2937",
  // Crimeline mode (dark)
  crimelineBg: "#0a0a0a",
  crimelineText: "#f9fafb",
  crimelineAccent: "#ef4444",
  crimelineBorder: "#dc2626",
  // Shared
  yellow: "#fbbf24",
  purple: "#a855f7",
};

// Neo-brutalist card style
const cardStyle = (isDark: boolean): React.CSSProperties => ({
  backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
  border: `3px solid ${isDark ? "#333" : "#1f2937"}`,
  boxShadow: isDark ? "6px 6px 0px #333" : "6px 6px 0px #1f2937",
  borderRadius: 12,
});

// ============ INTRO SCENE ============
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo scale animation
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Title slide in
  const titleY = interpolate(frame, [15, 40], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline fade in
  const taglineOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [45, 65], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decorative elements
  const decorScale = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.5)),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.timelineBg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Decorative chain links */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 200,
          width: 80,
          height: 80,
          border: `4px solid ${COLORS.timelineAccent}`,
          borderRadius: "50%",
          transform: `scale(${decorScale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 150,
          right: 250,
          width: 60,
          height: 60,
          border: `4px solid ${COLORS.yellow}`,
          borderRadius: "50%",
          transform: `scale(${decorScale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 200,
          right: 300,
          width: 40,
          height: 40,
          backgroundColor: COLORS.purple,
          transform: `scale(${decorScale}) rotate(45deg)`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 20,
        }}
      >
        <Img
          src={staticFile("coe_minimalisticv2.png")}
          style={{ width: 180, height: 180 }}
        />
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: "-0.03em",
          color: COLORS.timelineText,
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
        }}
      >
        chain of events
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: COLORS.timelineText,
          opacity: taglineOpacity * 0.8,
          transform: `translateY(${taglineY}px)`,
          marginTop: 16,
          maxWidth: 900,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        A living archive of CT's greatest hits, worst moments, and everything in between.
      </div>
    </AbsoluteFill>
  );
};

// ============ TIMELINE MODE SCENE ============
const TimelineModeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Mode badge animation
  const badgeScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  // Timeline line growing
  const lineHeight = interpolate(frame, [10, 80], [0, 600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Event cards sliding in
  const card1X = interpolate(frame, [30, 60], [-400, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const card2X = interpolate(frame, [45, 75], [400, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const card3X = interpolate(frame, [60, 90], [-400, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const cardOpacity = (startFrame: number) =>
    interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Sample events for timeline
  const events = [
    {
      date: "Jan 3, 2009",
      title: "Bitcoin Genesis Block",
      tag: "MILESTONE",
      tagColor: COLORS.timelineAccent,
    },
    {
      date: "May 22, 2010",
      title: "Bitcoin Pizza Day",
      tag: "CULTURAL",
      tagColor: COLORS.purple,
    },
    {
      date: "Jul 30, 2015",
      title: "Ethereum Mainnet Launch",
      tag: "TECH",
      tagColor: "#3b82f6",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.timelineBg,
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Mode badge */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: `translateX(-50%) scale(${badgeScale})`,
          backgroundColor: COLORS.timelineAccent,
          color: "white",
          padding: "12px 32px",
          borderRadius: 100,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
      >
        TIMELINE MODE
      </div>

      {/* Timeline line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 150,
          width: 6,
          height: lineHeight,
          background: `linear-gradient(to bottom, ${COLORS.timelineAccent}, ${COLORS.purple})`,
          borderRadius: 3,
          transform: "translateX(-50%)",
        }}
      />

      {/* Event cards */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 200,
          width: 420,
          ...cardStyle(false),
          padding: 24,
          transform: `translateX(${card1X}px)`,
          opacity: cardOpacity(30),
        }}
      >
        <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
          {events[0].date}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.timelineText,
            marginBottom: 12,
          }}
        >
          {events[0].title}
        </div>
        <span
          style={{
            backgroundColor: events[0].tagColor,
            color: "white",
            padding: "4px 12px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {events[0].tag}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          right: 100,
          top: 380,
          width: 420,
          ...cardStyle(false),
          padding: 24,
          transform: `translateX(${-card2X}px)`,
          opacity: cardOpacity(45),
        }}
      >
        <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
          {events[1].date}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.timelineText,
            marginBottom: 12,
          }}
        >
          {events[1].title}
        </div>
        <span
          style={{
            backgroundColor: events[1].tagColor,
            color: "white",
            padding: "4px 12px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {events[1].tag}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 100,
          top: 560,
          width: 420,
          ...cardStyle(false),
          padding: 24,
          transform: `translateX(${card3X}px)`,
          opacity: cardOpacity(60),
        }}
      >
        <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
          {events[2].date}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.timelineText,
            marginBottom: 12,
          }}
        >
          {events[2].title}
        </div>
        <span
          style={{
            backgroundColor: events[2].tagColor,
            color: "white",
            padding: "4px 12px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {events[2].tag}
        </span>
      </div>

      {/* Decorative dots on timeline */}
      {[200, 380, 560].map((top, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: top + 40,
            width: 20,
            height: 20,
            backgroundColor: COLORS.timelineAccent,
            borderRadius: "50%",
            transform: "translateX(-50%)",
            border: "4px solid white",
            opacity: cardOpacity(30 + i * 15),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ============ CRIMELINE MODE SCENE ============
const CrimelineModeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Mode badge animation
  const badgeScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 150 },
  });

  // Glitch effect for dramatic entrance
  const glitchX = frame < 20 ? Math.sin(frame * 2) * 5 : 0;

  // Stats counter animation
  const lostAmount = interpolate(frame, [30, 90], [0, 82], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const incidentCount = interpolate(frame, [30, 90], [0, 247], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Card animations
  const card1Y = interpolate(frame, [40, 70], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const card2Y = interpolate(frame, [55, 85], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const cardOpacity = (startFrame: number) =>
    interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.crimelineBg,
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
        transform: `translateX(${glitchX}px)`,
      }}
    >
      {/* Scan lines overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.03) 2px, rgba(255,0,0,0.03) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Mode badge */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: "50%",
          transform: `translateX(-50%) scale(${badgeScale})`,
          backgroundColor: COLORS.crimelineAccent,
          color: "white",
          padding: "12px 32px",
          borderRadius: 100,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
      >
        CRIMELINE MODE
      </div>

      {/* Stats bar */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 60,
          opacity: cardOpacity(20),
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: COLORS.crimelineAccent,
            }}
          >
            ${Math.floor(lostAmount)}B+
          </div>
          <div style={{ fontSize: 16, color: "#888", marginTop: 4 }}>
            Total Funds Lost
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: COLORS.crimelineAccent,
            }}
          >
            {Math.floor(incidentCount)}+
          </div>
          <div style={{ fontSize: 16, color: "#888", marginTop: 4 }}>
            Security Incidents
          </div>
        </div>
      </div>

      {/* Incident cards */}
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 320,
          width: 480,
          ...cardStyle(true),
          padding: 28,
          transform: `translateY(${card1Y}px)`,
          opacity: cardOpacity(40),
          borderColor: COLORS.crimelineAccent,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>
              Feb 2014
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: COLORS.crimelineText,
                marginBottom: 12,
              }}
            >
              Mt. Gox Collapse
            </div>
          </div>
          <span
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              color: COLORS.crimelineAccent,
              padding: "6px 14px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
              border: `1px solid ${COLORS.crimelineAccent}`,
            }}
          >
            EXCHANGE HACK
          </span>
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: COLORS.crimelineAccent,
            marginTop: 12,
          }}
        >
          $460M Lost
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 150,
          top: 540,
          width: 480,
          ...cardStyle(true),
          padding: 28,
          transform: `translateY(${card2Y}px)`,
          opacity: cardOpacity(55),
          borderColor: COLORS.crimelineAccent,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>
              Nov 2022
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: COLORS.crimelineText,
                marginBottom: 12,
              }}
            >
              FTX Bankruptcy
            </div>
          </div>
          <span
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              color: COLORS.crimelineAccent,
              padding: "6px 14px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
              border: `1px solid ${COLORS.crimelineAccent}`,
            }}
          >
            FRAUD
          </span>
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: COLORS.crimelineAccent,
            marginTop: 12,
          }}
        >
          $8B+ Lost
        </div>
      </div>

      {/* Warning decoration */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: cardOpacity(70),
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderBottom: `24px solid ${COLORS.yellow}`,
          }}
        />
        <span style={{ color: COLORS.yellow, fontSize: 18, fontWeight: 600 }}>
          Learn from history to protect your assets
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ============ FEATURES SCENE ============
const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // CT Lore filter chips - the native CT filters
  const ctFilters = [
    { name: "ZachXBT", color: "#3b82f6" },
    { name: "Cobie", color: "#8b5cf6" },
    { name: "GCR", color: "#10b981" },
    { name: "Do Kwon", color: "#ef4444" },
    { name: "SBF", color: "#f59e0b" },
    { name: "Vitalik", color: "#06b6d4" },
  ];

  // Tag filters
  const tagFilters = ["MILESTONE", "CULTURAL", "SECURITY", "TECH", "ECONOMIC"];

  // Animation for title
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animation for subtitle
  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.timelineBg,
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Title section */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: COLORS.timelineText,
            opacity: titleOpacity,
          }}
        >
          filter by ct lore
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#666",
            marginTop: 12,
            opacity: subtitleOpacity,
            maxWidth: 700,
          }}
        >
          Scattered tweets, deleted accounts, fading memories. We're fixing that.
        </div>
      </div>

      {/* CT Lore Filters - Main feature */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#888",
            marginBottom: 16,
            letterSpacing: "0.1em",
            opacity: interpolate(frame, [20, 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          CT PERSONALITIES
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {ctFilters.map((filter, i) => {
            const delay = 30 + i * 6;
            const chipScale = spring({
              frame: frame - delay,
              fps,
              config: { damping: 12, stiffness: 120 },
            });
            const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  ...cardStyle(false),
                  padding: "14px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transform: `scale(${Math.min(chipScale, 1)})`,
                  opacity,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: filter.color,
                  }}
                />
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: COLORS.timelineText,
                  }}
                >
                  {filter.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tag Filters */}
      <div
        style={{
          position: "absolute",
          top: 440,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#888",
            marginBottom: 16,
            letterSpacing: "0.1em",
            opacity: interpolate(frame, [50, 70], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          EVENT CATEGORIES
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {tagFilters.map((tag, i) => {
            const delay = 60 + i * 5;
            const tagScale = spring({
              frame: frame - delay,
              fps,
              config: { damping: 15, stiffness: 150 },
            });
            const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            const tagColors: Record<string, string> = {
              MILESTONE: COLORS.timelineAccent,
              CULTURAL: COLORS.purple,
              SECURITY: COLORS.crimelineAccent,
              TECH: "#3b82f6",
              ECONOMIC: COLORS.yellow,
            };

            return (
              <div
                key={i}
                style={{
                  backgroundColor: tagColors[tag] || COLORS.timelineAccent,
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  transform: `scale(${Math.min(tagScale, 1)})`,
                  opacity,
                  border: "2px solid #1f2937",
                  boxShadow: "3px 3px 0px #1f2937",
                }}
              >
                {tag}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom features row */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 40,
        }}
      >
        {[
          { label: "Year Jump", icon: "📅" },
          { label: "Smart Search", icon: "🔍" },
          { label: "BTC Metrics", icon: "📊" },
        ].map((item, i) => {
          const delay = 80 + i * 8;
          const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(frame, [delay, delay + 20], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity,
                transform: `translateY(${y}px)`,
              }}
            >
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: COLORS.timelineText,
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 100,
          width: 60,
          height: 60,
          border: `4px solid ${COLORS.timelineAccent}`,
          borderRadius: "50%",
          opacity: 0.3,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 200,
          right: 120,
          width: 40,
          height: 40,
          backgroundColor: COLORS.purple,
          transform: "rotate(45deg)",
          opacity: 0.3,
        }}
      />
    </AbsoluteFill>
  );
};

// ============ OUTRO SCENE ============
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main text animation
  const textScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  const urlOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlY = interpolate(frame, [40, 60], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulse animation for CTA
  const pulse = Math.sin(frame * 0.15) * 0.05 + 1;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        fontFamily: "Inter, system-ui, sans-serif",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Animated background circles */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `2px solid ${COLORS.timelineAccent}`,
          opacity: 0.1,
          transform: `scale(${1 + frame * 0.01})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: `2px solid ${COLORS.crimelineAccent}`,
          opacity: 0.15,
          transform: `scale(${1 + frame * 0.008})`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${textScale})`,
          marginBottom: 30,
        }}
      >
        <Img
          src={staticFile("coe_minimalisticv2.png")}
          style={{ width: 140, height: 140 }}
        />
      </div>

      {/* CTA Text */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 900,
          color: "white",
          textAlign: "center",
          transform: `scale(${textScale})`,
          letterSpacing: "-0.02em",
          maxWidth: 800,
          lineHeight: 1.3,
        }}
      >
        explore crypto history
      </div>

      {/* URL */}
      <div
        style={{
          marginTop: 40,
          opacity: urlOpacity,
          transform: `translateY(${urlY}px) scale(${pulse})`,
        }}
      >
        <div
          style={{
            background: `linear-gradient(90deg, ${COLORS.timelineAccent}, ${COLORS.purple})`,
            padding: "16px 48px",
            borderRadius: 100,
            fontSize: 32,
            fontWeight: 700,
            color: "white",
          }}
        >
          chainofevents.xyz
        </div>
      </div>

      {/* Social handles */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          display: "flex",
          gap: 40,
          opacity: urlOpacity,
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }}>
          @chainofevents
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ============ MAIN COMPOSITION ============
export const WebsiteShowcase: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Intro - 4 seconds (120 frames) */}
      <Sequence from={0} durationInFrames={120}>
        <IntroScene />
      </Sequence>

      {/* Timeline Mode - 4 seconds (120 frames) */}
      <Sequence from={120} durationInFrames={120}>
        <TimelineModeScene />
      </Sequence>

      {/* Crimeline Mode - 4 seconds (120 frames) */}
      <Sequence from={240} durationInFrames={120}>
        <CrimelineModeScene />
      </Sequence>

      {/* Features - 4 seconds (120 frames) */}
      <Sequence from={360} durationInFrames={120}>
        <FeaturesScene />
      </Sequence>

      {/* Outro - 4 seconds (120 frames) */}
      <Sequence from={480} durationInFrames={120}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
