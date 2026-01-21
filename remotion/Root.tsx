import React from "react";
import { Composition } from "remotion";
import { Promo16x9 } from "./compositions/Promo16x9";
import { WebsiteShowcase } from "./compositions/WebsiteShowcase";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Original promo composition */}
      <Composition
        id="promo-16x9"
        component={Promo16x9}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* New website showcase video - 20 seconds at 30fps */}
      <Composition
        id="website-showcase"
        component={WebsiteShowcase}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
