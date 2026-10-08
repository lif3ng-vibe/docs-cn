'use client';

import { useEffect, useRef } from 'react';
import { VIDEO_SRC } from '../media-assets';
import {
  MediaContainer,
  ProgressBadge,
  useGenerationProgress,
} from './image-generation';

export function VideoGenerationPreview({
  animationKey,
}: {
  animationKey: number;
}) {
  const { progress, done, blurAmount } = useGenerationProgress(animationKey);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!done) return;
    videoRef.current?.play().catch(() => {});
  }, [done]);

  return (
    <MediaContainer>
      <video
        aria-label="AI 生成的视频：河马在纽约街头追逐猎豹"
        className="size-full object-cover"
        key={animationKey}
        loop
        muted
        playsInline
        preload="auto"
        ref={videoRef}
        src={VIDEO_SRC}
        style={{ filter: `blur(${blurAmount}px)` }}
      />
      <ProgressBadge hidden={done} progress={progress} />
    </MediaContainer>
  );
}
