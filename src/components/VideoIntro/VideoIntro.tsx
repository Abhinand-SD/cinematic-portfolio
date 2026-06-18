"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import CinematicLayer from "@/components/CinematicLayer/CinematicLayer";
import HeroContent from "@/components/HeroContent/HeroContent";
import ScrollIndicator from "@/components/ScrollIndicator/ScrollIndicator";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./VideoIntro.module.css";

const VIDEO_SRC = "/heroVideo.mp4";
const SOUND_HINT_TIMEOUT = 5500;

interface VideoIntroProps {
  /** id of the section the scroll indicator should scroll to. */
  nextSectionId: string;
}

export default function VideoIntro({ nextSectionId }: VideoIntroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const fgVideoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [showSoundHint, setShowSoundHint] = useState(true);

  const prefersReduced = usePrefersReducedMotion();

  // Keep the foreground video's actual mute state in sync with React state.
  useEffect(() => {
    const fg = fgVideoRef.current;
    if (fg) fg.muted = isMuted;
    // Ambient layer stays silent always.
    const bg = bgVideoRef.current;
    if (bg) bg.muted = true;
  }, [isMuted]);

  // Auto-hide the "tap for sound" hint after a few seconds.
  useEffect(() => {
    if (!showSoundHint) return;
    const id = window.setTimeout(
      () => setShowSoundHint(false),
      SOUND_HINT_TIMEOUT,
    );
    return () => window.clearTimeout(id);
  }, [showSoundHint]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    setShowSoundHint(false);
    // Ensure playback resumes when the user reaches for sound.
    const fg = fgVideoRef.current;
    if (fg?.paused) {
      void fg.play().catch(() => {});
      void bgVideoRef.current?.play().catch(() => {});
    }
  }, []);

  // Load-in cinematic fade for the video stage + controls.
  useGSAP(
    () => {
      if (prefersReduced) {
        gsap.set(`.${styles.stage}, .${styles.controls}`, {
          opacity: 1,
          scale: 1,
        });
        return;
      }
      gsap
        .timeline()
        .from(`.${styles.stage}`, {
          opacity: 0,
          scale: 1.08,
          duration: 1.8,
          ease: "power2.out",
          // Strip the inline transform GSAP leaves behind: a lingering transform
          // promotes .stage to its own compositor layer, which the browser
          // rasterizes at a capped size and downsamples the video (blur on
          // large/full-screen views). Clearing it lets the video render sharp.
          clearProps: "all",
        })
        .from(
          `.${styles.controls}`,
          {
            opacity: 0,
            y: 18,
            duration: 1.1,
            ease: "power3.out",
            clearProps: "all",
          },
          "-=0.7",
        );
    },
    { scope: rootRef, dependencies: [prefersReduced] },
  );

  return (
    <section ref={rootRef} className={styles.hero}>
      <div className={styles.stage}>
        {/* Ambient blurred duplicate — decorative, always muted. */}
        <video
          ref={bgVideoRef}
          className={styles.ambient}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Foreground feature video. */}
        <video
          ref={fgVideoRef}
          className={styles.foreground}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />

        {/* Cinematic dark + warm/cool gradient overlays for readability. */}
        <div className={styles.gradientTop} aria-hidden="true" />
        <div className={styles.gradientBottom} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.warmGlow} aria-hidden="true" />
        <div className={styles.blueGlow} aria-hidden="true" />

        {/* Floating Three.js bokeh layer. */}
        <CinematicLayer />
      </div>

      <HeroContent />

      <ScrollIndicator targetId={nextSectionId} />

      {/* Glassmorphism controls. */}
      <div className={styles.controls}>
        <button
          type="button"
          className={`${styles.soundHint} ${showSoundHint ? styles.soundHintVisible : ""}`}
          onClick={toggleMute}
          aria-hidden={!showSoundHint}
          tabIndex={showSoundHint ? 0 : -1}
        >
          <span className={styles.soundHintDot} />
          Tap for sound
        </button>

        <button
          type="button"
          className={styles.controlButton}
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          aria-pressed={!isMuted}
        >
          {isMuted ? <MutedIcon /> : <SoundIcon />}
        </button>
      </div>
    </section>
  );
}

/* ---- Inline icons (currentColor, 20px) ---- */

function SoundIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 6a9 9 0 0 1 0 12" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="m16 9 5 6" />
      <path d="m21 9-5 6" />
    </svg>
  );
}
