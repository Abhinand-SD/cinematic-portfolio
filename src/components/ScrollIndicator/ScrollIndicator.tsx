"use client";

import styles from "./ScrollIndicator.module.css";

interface ScrollIndicatorProps {
  /** id of the section to smooth-scroll to on click. */
  targetId: string;
}

/**
 * Bottom-center scroll affordance: a label above a thin vertical line with a
 * pulse travelling down it. Clicking smooth-scrolls to the next section.
 */
export default function ScrollIndicator({ targetId }: ScrollIndicatorProps) {
  const handleScroll = () => {
    const target = document.getElementById(targetId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      className={styles.indicator}
      onClick={handleScroll}
      aria-label="Scroll to next section"
    >
      <span className={styles.label}>Scroll</span>
      <span className={styles.line} aria-hidden="true">
        <span className={styles.pulse} />
      </span>
    </button>
  );
}
