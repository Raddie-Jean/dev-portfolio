"use client";

/* eslint-disable @next/next/no-img-element -- Bundled portfolio assets are served directly. */

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  HandGrabbing,
  Sparkle,
} from "@phosphor-icons/react";
import gsap from "gsap";
import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { DesktopWindow } from "../DesktopWindow";
import { LabProjectPreview } from "./LabProjectPreview";
import { labProjects } from "./labData";
import { useInfiniteLabCarousel } from "./useInfiniteLabCarousel";

const labSlugs = labProjects.map((project) => project.slug);

export default function AILabPage() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(Math.min(1, labProjects.length - 1));
  const { controls, dragged } = useInfiniteLabCarousel(carouselRef, labSlugs, setActiveIndex);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(labProjects[Math.min(1, labProjects.length - 1)]?.slug ?? "");
  const activeProject = labProjects.find((project) => project.slug === selectedSlug);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const heading = Array.from(
      page.querySelectorAll<HTMLElement>(
        ".ai-lab-heading > p, .ai-lab-heading > h1, .ai-lab-heading > span",
      ),
    );
    const modules = Array.from(
      page.querySelectorAll<HTMLElement>(".ai-lab-carousel-shell"),
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set([...heading, ...modules], { autoAlpha: 1 });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          heading,
          { autoAlpha: 0, y: 22, filter: "blur(7px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.58,
            stagger: 0.11,
            clearProps: "transform,filter,opacity,visibility",
          },
        )
        .fromTo(
          modules,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.52, clearProps: "opacity,visibility" },
          ">",
        );
    }, page);
    return () => context.revert();
  }, []);

  return (
    <main ref={pageRef} className="ai-lab more-cases-page">
      <img className="ai-lab-bg" src="/assets/lab/raddie-cosmic-garden.png" alt="" />
      <div className="ai-lab-shade" />

      <header className="ai-lab-nav">
        <Link href="/#work">
          <ArrowLeft weight="bold" />
          返回作品桌面
        </Link>
        <span>JEAN / AI LAB</span>
        <i>PROTOTYPES + VIBE CODING ARCHIVE</i>
      </header>

      <section className="ai-lab-heading">
        <p><Sparkle weight="fill" /> AI LAB / VIBE CODING ARCHIVE</p>
        <h1>Making Ideas Tangible</h1>
        <span>用 AI 快速实现想法，记录正在生长的灵感。</span>
      </section>

      <section className="ai-lab-carousel-shell" aria-label="AI Lab 作品拖拽卡片">
        <div
          ref={carouselRef}
          className="ai-lab-carousel"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              controls.current?.step(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          {labProjects.map((project, index) => (
            <button
              type="button"
              key={project.slug}
              data-lab-card
              data-card-index={index}
              className={`ai-lab-case-card ${activeIndex === index ? "is-centered" : ""}`}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) controls.current?.to(index);
              }}
              onClick={() => {
                if (dragged.current) {
                  dragged.current = false;
                  return;
                }
                setSelectedSlug(project.slug);
                setPreviewOpen(true);
              }}
              aria-label={`打开作品窗口：${project.title}`}
            >
              <span className="ai-lab-card-index"><img src="/assets/lab/reference-print-arrow.png" alt="" aria-hidden="true" draggable={false} /><span>{project.index}</span></span>
              <div className="ai-lab-card-copy">
                <h2>{project.title}</h2>
                <p>{project.category}</p>
              </div>
              <span className="ai-lab-card-media">
                <span className="ai-lab-media-backing" aria-hidden="true" />
                <span className="ai-lab-media-tab" aria-hidden="true">LAB</span>
                <span className="ai-lab-media-mat">
                  <img src={project.cover} alt={project.englishTitle} draggable={false} loading="lazy" />
                </span>
                <img className="ai-lab-pouch" src="/assets/lab/clear-pouch-v2.png" alt="" aria-hidden="true" draggable={false} />
                <span className="ai-lab-ticket" aria-hidden="true">JEAN / {project.index}</span>
                <span className="ai-lab-seal" aria-hidden="true"><Sparkle weight="fill" /></span>
              </span>
              <span className="ai-lab-card-action">
                OPEN {project.mediaLabel} <ArrowUpRight weight="bold" />
              </span>
            </button>
          ))}
        </div>
        <div className="ai-lab-carousel-controls">
          <button type="button" aria-label="上一个案例" onClick={() => controls.current?.step(-1)}><ArrowLeft weight="bold" /></button>
          <p className="ai-lab-drag-hint"><HandGrabbing weight="fill" /><span className="ai-lab-carousel-instruction">拖动浏览 · 点击打开</span><span aria-live="polite">{labProjects[activeIndex]?.index} / {labProjects.length}</span></p>
          <button type="button" aria-label="下一个案例" onClick={() => controls.current?.step(1)}><ArrowRight weight="bold" /></button>
        </div>
      </section>

      {previewOpen && activeProject && (
        <DesktopWindow
          title={`${activeProject.index}_${activeProject.englishTitle.toUpperCase().replaceAll(" ", "-")}.${activeProject.mediaKind.toUpperCase()}`}
          className={`ai-preview-window lab-project-window ${activeProject.demoHref ? "lab-demo-window" : ""}`}
          centered
          topLayer
          zIndex={240}
          onFocus={() => undefined}
          onClose={() => setPreviewOpen(false)}
        >
          <LabProjectPreview key={activeProject.slug} project={activeProject} />
        </DesktopWindow>
      )}
    </main>
  );
}
