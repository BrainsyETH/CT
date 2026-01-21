import React from "react";
import { Composition } from "remotion";
import { Promo16x9 } from "./compositions/Promo16x9";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="promo-16x9"
        component={Promo16x9}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

