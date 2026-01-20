import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/events-db";
import { formatDate, formatCurrency, formatFundsLost } from "@/lib/formatters";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://chainofevents.xyz";

interface EmbedPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EmbedPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: event.title,
    description: event.summary,
    robots: "noindex, nofollow", // Embeds shouldn't be indexed
  };
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const isCrimeline = event.mode?.includes("crimeline");
  const eventUrl = `${SITE_URL}/?event=${encodeURIComponent(event.id)}`;

  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${isCrimeline ? "#1a1a2e" : "#ffffff"};
            color: ${isCrimeline ? "#e0e0e0" : "#333333"};
            padding: 16px;
            min-height: 100vh;
          }
          .card {
            border: 2px solid ${isCrimeline ? "#6b21a8" : "#0d9488"};
            border-radius: 8px;
            overflow: hidden;
            max-width: 400px;
            background: ${isCrimeline ? "#1e1e3f" : "#ffffff"};
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .image-container {
            position: relative;
            width: 100%;
            aspect-ratio: 16/9;
            background: ${isCrimeline ? "#2d2d5a" : "#f3f4f6"};
          }
          .image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .content {
            padding: 16px;
          }
          .date {
            font-size: 12px;
            font-weight: 600;
            color: ${isCrimeline ? "#a78bfa" : "#0d9488"};
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .title {
            font-size: 18px;
            font-weight: 700;
            margin: 8px 0;
            color: ${isCrimeline ? "#ffffff" : "#111827"};
            line-height: 1.3;
          }
          .summary {
            font-size: 14px;
            line-height: 1.5;
            color: ${isCrimeline ? "#d1d5db" : "#4b5563"};
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .metrics {
            display: flex;
            gap: 16px;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid ${isCrimeline ? "#374151" : "#e5e7eb"};
            font-size: 12px;
          }
          .metric-label {
            color: ${isCrimeline ? "#9ca3af" : "#6b7280"};
          }
          .metric-value {
            font-weight: 600;
            color: ${isCrimeline ? "#e5e7eb" : "#111827"};
          }
          .crimeline-badge {
            display: inline-block;
            padding: 4px 8px;
            background: ${isCrimeline ? "#581c87" : "#fee2e2"};
            color: ${isCrimeline ? "#e9d5ff" : "#991b1b"};
            font-size: 11px;
            font-weight: 600;
            border-radius: 4px;
            margin-top: 8px;
          }
          .funds-lost {
            color: #a855f7;
            font-weight: 700;
            font-size: 14px;
            margin-top: 8px;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid ${isCrimeline ? "#374151" : "#e5e7eb"};
          }
          .view-link {
            font-size: 12px;
            font-weight: 600;
            color: ${isCrimeline ? "#a78bfa" : "#0d9488"};
            text-decoration: none;
          }
          .view-link:hover {
            text-decoration: underline;
          }
          .branding {
            font-size: 10px;
            color: ${isCrimeline ? "#6b7280" : "#9ca3af"};
          }
        `}</style>
      </head>
      <body>
        <div className="card">
          {event.image && (
            <div className="image-container">
              <img src={event.image} alt={event.title} className="image" />
            </div>
          )}
          <div className="content">
            <div className="date">{formatDate(event.date)}</div>
            <h1 className="title">{event.title}</h1>
            <p className="summary">{event.summary}</p>

            {event.crimeline && (
              <>
                <span className="crimeline-badge">{event.crimeline.type}</span>
                {event.crimeline.funds_lost_usd && (
                  <div className="funds-lost">
                    {formatFundsLost(event.crimeline.funds_lost_usd)} Lost
                  </div>
                )}
              </>
            )}

            {event.metrics && event.category?.includes("Bitcoin") && (
              <div className="metrics">
                {event.metrics.btc_price_usd !== undefined && (
                  <div>
                    <span className="metric-label">BTC: </span>
                    <span className="metric-value">{formatCurrency(event.metrics.btc_price_usd)}</span>
                  </div>
                )}
                {event.metrics.market_cap_usd !== undefined && (
                  <div>
                    <span className="metric-label">MCap: </span>
                    <span className="metric-value">{formatCurrency(event.metrics.market_cap_usd)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="footer">
              <a href={eventUrl} target="_blank" rel="noopener noreferrer" className="view-link">
                View Full Details &rarr;
              </a>
              <span className="branding">Chain of Events</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
