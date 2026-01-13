"use client";

import { VIDEO_PROVIDERS, VIDEO_ORIENTATIONS } from "@/lib/constants";

interface VideoFieldsProps {
  videoUrl: string;
  videoProvider: string;
  videoPosterUrl: string;
  videoCaption: string;
  videoOrientation: string;
  onVideoUrlChange: (value: string) => void;
  onProviderChange: (value: string) => void;
  onPosterUrlChange: (value: string) => void;
  onCaptionChange: (value: string) => void;
  onOrientationChange: (value: string) => void;
  inputClassName: string;
  labelClassName: string;
  isCrimeline: boolean;
}

export function VideoFields({
  videoUrl,
  videoProvider,
  videoPosterUrl,
  videoCaption,
  videoOrientation,
  onVideoUrlChange,
  onProviderChange,
  onPosterUrlChange,
  onCaptionChange,
  onOrientationChange,
  inputClassName,
  labelClassName,
  isCrimeline,
}: VideoFieldsProps) {
  return (
    <div
      className={`p-4 rounded-lg ${
        isCrimeline
          ? "bg-gray-800/50 border border-gray-700"
          : "bg-gray-50 border border-gray-200"
      }`}
    >
      <h3
        className={`text-sm font-semibold mb-3 ${
          isCrimeline ? "text-gray-300" : "text-gray-700"
        }`}
      >
        Video (Optional)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventVideoUrl" className={labelClassName}>
            Video URL
          </label>
          <input
            type="url"
            id="eventVideoUrl"
            value={videoUrl}
            onChange={(e) => onVideoUrlChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="eventVideoProvider" className={labelClassName}>
            Provider
          </label>
          <select
            id="eventVideoProvider"
            value={videoProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            className={inputClassName}
          >
            <option value="">Select provider...</option>
            {VIDEO_PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>
                {provider === "self_hosted"
                  ? "Self-hosted"
                  : provider.charAt(0).toUpperCase() + provider.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="eventVideoPosterUrl" className={labelClassName}>
            Video Poster/Thumbnail URL
          </label>
          <input
            type="url"
            id="eventVideoPosterUrl"
            value={videoPosterUrl}
            onChange={(e) => onPosterUrlChange(e.target.value)}
            placeholder="https://..."
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="eventVideoCaption" className={labelClassName}>
            Video Caption
          </label>
          <input
            type="text"
            id="eventVideoCaption"
            value={videoCaption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Brief description of video"
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="eventVideoOrientation" className={labelClassName}>
            Orientation
          </label>
          <select
            id="eventVideoOrientation"
            value={videoOrientation}
            onChange={(e) => onOrientationChange(e.target.value)}
            className={inputClassName}
          >
            <option value="">Landscape (default)</option>
            {VIDEO_ORIENTATIONS.map((orientation) => (
              <option key={orientation} value={orientation}>
                {orientation === "landscape"
                  ? "Landscape (16:9)"
                  : orientation === "portrait"
                  ? "Portrait (9:16)"
                  : "Square (1:1)"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
