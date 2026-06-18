"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import FadeIn from "./FadeIn";
import LiveProjectButton from "./LiveProjectButton";

// Card-stack geometry. Each pinned card rests STACK_TOP px from the top of the
// viewport; every earlier card pins STACK_GAP px higher so its top edge peeks
// out as a deck behind the active card, and recedes SCALE_STEP per level so the
// covered cards read as stacked depth.
const STACK_TOP = 88;
const STACK_GAP = 26;
const SCALE_STEP = 0.04;

interface ProjectData {
  number: string;
  category: string;
  name: string;
  liveUrl: string;
  col1Image1: string;
  col1Image2: string;
  col2Image: string;
}

const PROJECTS: ProjectData[] = [
  {
    number: "01",
    category: "Personal",
    name: "Forge",
    liveUrl: "https://forge-pink-seven.vercel.app/",
    col1Image1: "/Forge.png",
    col1Image2: "/Forge1.png",
    col2Image: "/Forge2.png",
  },
  {
    number: "02",
    category: "Personal",
    name: "LawLab",
    liveUrl: "https://lawlab-self.vercel.app",
    col1Image1: "/lawlab.png",
    col1Image2: "/lawlab1.png",
    col2Image: "/lawlab2.png",
  },
  {
    number: "03",
    category: "Personal · GenAI",
    name: "ResumeIQ",
    liveUrl: "https://resumeiq-harsh.vercel.app/",
    col1Image1: "/resumeiq-hero.png",
    col1Image2: "/resumeiq-feedback.png",
    col2Image: "/resumeiq-score.png",
  },
  {
    number: "04",
    category: "Personal · Design",
    name: "Notch",
    liveUrl: "https://notch-zeta.vercel.app/",
    col1Image1: "/notch-hero.png",
    col1Image2: "/notch-pricing.png",
    col2Image: "/notch-mockup.png",
  },
];

interface ProjectCardProps {
  project: ProjectData;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

const ProjectCard = ({ project, index, total, progress }: ProjectCardProps) => {
  // Scale is driven by the CONTAINER's scroll progress (passed in), NOT the
  // card's own position: a pinned sticky element stops moving relative to the
  // viewport, so a per-card useScroll would freeze at 0 and never animate.
  // Each card holds full size until the stack scroll reaches its slot
  // (index / total), then recedes to targetScale as later cards cover it. The
  // last card's targetScale is 1, so the active card on top never shrinks.
  const targetScale = 1 - (total - 1 - index) * SCALE_STEP;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  return (
    <div
      className="sticky h-[85vh] w-full"
      style={{ top: `${STACK_TOP + index * STACK_GAP}px` }}
    >
      <motion.article
        style={{ scale }}
        className="origin-top mx-auto h-full w-full flex flex-col gap-4 sm:gap-6 md:gap-8 rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:p-6 md:p-8"
      >
        {/* Top row: number + meta + button */}
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex flex-row items-start gap-3 sm:gap-6 md:gap-10 min-w-0 w-full">
            <div
              className="shrink-0 font-black text-[#D7E2EA] leading-none"
              style={{ fontSize: "clamp(2.5rem, 10vw, 140px)" }}
            >
              {project.number}
            </div>

            <div className="flex flex-col gap-1 sm:gap-3 pt-1 sm:pt-3 md:pt-4 min-w-0 flex-1">
              <span
                className="font-light uppercase tracking-widest text-[#D7E2EA]/60"
                style={{ fontSize: "clamp(0.65rem, 1.2vw, 1rem)" }}
              >
                {project.category}
              </span>
              <h3
                className="font-medium uppercase text-[#D7E2EA] leading-tight"
                style={{ fontSize: "clamp(1.1rem, 2.2vw, 2.1rem)" }}
              >
                {project.name}
              </h3>
            </div>
          </div>

          <div className="shrink-0 self-start sm:self-auto pt-1 sm:pt-2 md:pt-3 w-full sm:w-auto">
            <LiveProjectButton href={project.liveUrl} className="w-full sm:w-auto" />
          </div>
        </div>

        {/* Bottom row: two-column image grid */}
        <div className="grid grid-cols-[40%_60%] gap-3 sm:gap-4 md:gap-5 flex-1 min-h-0">
          {/* Left column - 2 stacked */}
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 min-h-0">
            <div
              className="overflow-hidden rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: "clamp(130px, 16vw, 230px)" }}
            >
              <img
                src={project.col1Image1}
                alt={`${project.name} preview 1`}
                className="h-full w-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
            <div
              className="overflow-hidden rounded-[40px] sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: "clamp(160px, 22vw, 340px)" }}
            >
              <img
                src={project.col1Image2}
                alt={`${project.name} preview 2`}
                className="h-full w-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>

          {/* Right column - 1 tall */}
          <div className="overflow-hidden rounded-[40px] sm:rounded-[50px] md:rounded-[60px] min-h-0">
            <img
              src={project.col2Image}
              alt={`${project.name} preview 3`}
              className="h-full w-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
        </div>
      </motion.article>
    </div>
  );
};

const ProjectsSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // A single scroll track for the whole stack. This container scrolls normally
  // (only its card children are sticky), so its progress keeps advancing the
  // entire time the cards are pinned — that's what drives the card scaling.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="projects"
      className="font-kanit relative z-10 -mt-10 sm:-mt-12 md:-mt-14 w-full rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] bg-[#0C0C0C] px-4 sm:px-6 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-24"
    >
      <FadeIn y={40}>
        <h2
          className="hero-heading text-center font-black uppercase tracking-tight leading-none mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
        >
          Project
        </h2>
      </FadeIn>

      <div ref={containerRef} className="mx-auto max-w-7xl">
        {PROJECTS.map((project, i) => (
          <ProjectCard
            key={project.number}
            project={project}
            index={i}
            total={PROJECTS.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;
