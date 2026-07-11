import { SkeletonTimeline } from "@/components/SkeletonTimeline";

/**
 * Streamed instantly while the server awaits the events query,
 * so visitors see a skeleton instead of a blank page.
 */
export default function Loading() {
  return <SkeletonTimeline />;
}
