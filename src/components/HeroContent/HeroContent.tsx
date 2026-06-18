"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./HeroContent.module.css";

/**
 * Overlay portfolio content: small uppercase tagline, the name stacked as two
 * huge lines, and a role subtitle. Animates in with a slow, staggered GSAP
 * timeline (premium expo easing). Under reduced motion it appears instantly.
 */
export default function HeroContent() {
  const root = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>(`.${styles.reveal}`);

      if (prefersReduced) {
        gsap.set(targets, { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" });
        return;
      }

      gsap.set(targets, {
        opacity: 0,
        y: 64,
        clipPath: "inset(0 0 100% 0)",
      });

      gsap
        .timeline({ delay: 0.45 })
        .to(targets, {
          opacity: 1,
          y: 0,
          clipPath: "inset(0 0 0% 0)",
          duration: 1.5,
          ease: "expo.out",
          stagger: 0.16,
        });
    },
    { scope: root, dependencies: [prefersReduced] },
  );

  return (
    <div className={styles.content} ref={root}>
      <p className={`${styles.tagline} ${styles.reveal}`}>
        Creative Developer &amp; Designer
      </p>

      <h1 className={styles.name}>
        <span className={`${styles.nameLine} ${styles.reveal}`}>Abhinand</span>
        <span className={`${styles.nameLine} ${styles.nameLast} ${styles.reveal}`}>
          SD
        </span>
      </h1>

      <p className={`${styles.role} ${styles.reveal}`}>
        Building immersive, cinematic web experiences with React, Three.js
        &amp; motion design.
      </p>
    </div>
  );
}
