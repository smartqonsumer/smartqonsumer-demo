'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import styles from './HeroVideo.module.css';

const BUTTON_CLASS =
  'grid h-10 w-10 place-items-center rounded-full bg-neutral-950/60 text-white backdrop-blur transition-colors hover:bg-neutral-950/80';

/** 75 → "1:15". */
function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** iOS Safari only lets the <video> element itself go fullscreen (native player). */
type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * Hero presentation video. It autoplays muted (browsers block autoplay with
 * sound); the soundtrack is muxed into the MP4 so it stays in sync, and only
 * plays once the visitor turns it on with the speaker button. Fullscreen applies
 * to the whole player so the custom controls stay available.
 */
export function HeroVideo() {
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // React renders `muted` as a DOM property only after hydration; set it
  // explicitly so autoplay is never blocked. The metadata may already be
  // loaded before hydration attaches the listeners.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (video.duration) setDuration(video.duration);
    setCurrentTime(video.currentTime);
  }, []);

  // Follows every way of leaving fullscreen too (Escape key, browser UI).
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted && video.paused) void video.play();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullscreen = () => {
    const player = playerRef.current;
    const video = videoRef.current as IosVideo | null;
    if (!player || !video) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (player.requestFullscreen) void player.requestFullscreen();
    else video.webkitEnterFullscreen?.();
  };

  return (
    <div
      ref={playerRef}
      className={`relative overflow-hidden ${fullscreen ? 'flex items-center bg-black' : 'rounded-lg bg-white shadow-xl'}`}
    >
      <video
        ref={videoRef}
        className={`w-full cursor-pointer ${fullscreen ? 'h-full object-contain' : 'aspect-video'}`}
        width={1280}
        height={720}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/SmartQonsumeR-home-v6-poster.jpg"
        aria-label="Présentation de SmartQonsumer"
        onClick={togglePlay}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      >
        <source src="/assets/SmartQonsumeR-home-v6.mp4" type="video/mp4" />
      </video>

      <div className={`absolute ${fullscreen ? 'right-6 top-6' : 'right-3 top-3'}`}>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? 'Activer le son' : 'Couper le son'}
          aria-pressed={!muted}
          className={BUTTON_CLASS}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
            {muted ? (
              <path d="m22 9-6 6M16 9l6 6" />
            ) : (
              <>
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div className={`absolute flex items-center gap-2 ${fullscreen ? 'inset-x-6 bottom-6' : 'inset-x-3 bottom-3'}`}>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={paused ? 'Lire la vidéo' : 'Mettre la vidéo en pause'}
          className={`${BUTTON_CLASS} shrink-0`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            {paused ? <path d="M8 5.5v13l11-6.5z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
          </svg>
        </button>
        <div className={`${styles.seekBar} flex h-10 min-w-0 flex-1 items-center gap-3 rounded-full bg-neutral-950/60 px-4 text-[11px] font-medium tabular-nums text-white backdrop-blur`}>
          <span aria-hidden="true">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seek(Number(event.currentTarget.value))}
            aria-label="Position de lecture"
            aria-valuetext={`${formatTime(currentTime)} sur ${formatTime(duration)}`}
            disabled={!duration}
            className={styles.seek}
            style={{ '--progress': `${duration ? (currentTime / duration) * 100 : 0}%` } as CSSProperties}
          />
          <span aria-hidden="true" className="text-white/70">
            {formatTime(duration)}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          className={`${BUTTON_CLASS} shrink-0`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            {fullscreen ? (
              <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
            ) : (
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
