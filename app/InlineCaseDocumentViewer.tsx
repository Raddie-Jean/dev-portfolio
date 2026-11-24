"use client";

/* eslint-disable @next/next/no-img-element -- Case pages are pre-rendered local assets. */

import {
  ArrowLeft,
  ArrowUpRight,
  ArrowsIn,
  ArrowsOut,
  FilePdf,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  SidebarSimple,
} from "@phosphor-icons/react";
import gsap from "gsap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCasePageSources, type CaseStudy } from "./caseData";
import type { PortfolioLanguage } from "./usePortfolioLanguage";

type ViewerMode = "overview" | "reader";

export function InlineCaseDocumentViewer({
  project,
  language,
  initialMode = "overview",
}: {
  project: CaseStudy;
  language: PortfolioLanguage;
  initialMode?: ViewerMode;
}) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageViewportRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollFrameRef = useRef<number | null>(null);
  const [mode, setMode] = useState<ViewerMode>(initialMode);
  const [activePage, setActivePage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [thumbnailsOpen, setThumbnailsOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isChinese = language === "zh";
  const pages = useMemo(() => getCasePageSources(project), [project]);

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 700px)");
    const applyCompactReadingLayout = () => {
      if (compactQuery.matches) {
        // Use the full width for the page on phones. The thumbnail rail remains
        // available through its toggle when readers need to jump between pages.
        setThumbnailsOpen(false);
        setZoom(80);
      }
    };

    applyCompactReadingLayout();
    compactQuery.addEventListener("change", applyCompactReadingLayout);
    return () => compactQuery.removeEventListener("change", applyCompactReadingLayout);
  }, []);

  const transitionTo = useCallback((nextMode: ViewerMode) => {
    // Reopening remounts the page stack at the top, so its indicators must start there too.
    if (nextMode === "reader") setActivePage(0);
    const content = contentRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!content || reduced) {
      setMode(nextMode);
      return;
    }
    gsap.killTweensOf(content);
    gsap.to(content, {
      autoAlpha: 0,
      y: 8,
      duration: 0.16,
      ease: "power2.in",
      onComplete: () => {
        setMode(nextMode);
        requestAnimationFrame(() => {
          gsap.fromTo(
            content,
            { autoAlpha: 0, y: -6 },
            { autoAlpha: 1, y: 0, duration: 0.28, ease: "power3.out", clearProps: "all" },
          );
        });
      },
    });
  }, []);

  useEffect(() => () => {
    if (contentRef.current) gsap.killTweensOf(contentRef.current);
    if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
  }, []);

  const syncActivePage = () => {
    if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = requestAnimationFrame(() => {
      const viewport = pageViewportRef.current;
      if (!viewport) return;
      const readingLine = viewport.getBoundingClientRect().top + 24;
      let closest = 0;
      let distance = Number.POSITIVE_INFINITY;
      pageRefs.current.forEach((page, index) => {
        if (!page) return;
        const nextDistance = Math.abs(page.getBoundingClientRect().top - readingLine);
        if (nextDistance < distance) {
          distance = nextDistance;
          closest = index;
        }
      });
      setActivePage(closest);
    });
  };

  const selectPage = (nextPage: number) => {
    const index = Math.min(pages.length - 1, Math.max(0, nextPage));
    setActivePage(index);
    pageRefs.current[index]?.scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const toggleFullscreen = async () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (document.fullscreenElement === viewer) {
      await document.exitFullscreen();
      return;
    }
    if (isFullscreen && !document.fullscreenElement) {
      setIsFullscreen(false);
      return;
    }
    try {
      await viewer.requestFullscreen();
    } catch {
      setIsFullscreen((current) => !current);
    }
  };

  return (
    <div
      ref={viewerRef}
      className={`case-window-experience is-${mode} ${isFullscreen ? "is-browser-fullscreen" : ""}`}
      data-case={project.slug}
    >
      <div ref={contentRef} className="case-window-content">
        <section className="case-window-stage" aria-label={isChinese ? "案例内容" : "Case content"}>
          {mode === "overview" ? (
            <button
              type="button"
              className="case-overview-cover"
              onClick={() => transitionTo("reader")}
              aria-label={isChinese ? `阅读 ${project.title} 完整案例` : `Read full ${project.englishTitle} case`}
            >
              <img
                src={project.overviewCover ?? pages[0] ?? project.covers.landscape}
                alt={project.englishTitle}
              />
            </button>
          ) : (
            <div className="inline-case-document">
              <div className="inline-case-toolbar">
                <button
                  type="button"
                  className="inline-case-sidebar-toggle"
                  aria-pressed={thumbnailsOpen}
                  onClick={() => setThumbnailsOpen((current) => !current)}
                  title={isChinese ? "收起或展开缩略图" : "Toggle thumbnails"}
                >
                  <SidebarSimple weight="bold" />
                  <span>{isChinese ? "缩略图" : "PAGES"}</span>
                </button>
                <span className="inline-case-view-only">
                  <FilePdf weight="fill" />
                  {isChinese ? "连续阅读 · 仅供查阅" : "CONTINUOUS VIEW · READ ONLY"}
                </span>
                <div className="inline-case-zoom" aria-label={isChinese ? "文档缩放" : "Document zoom"}>
                  <button
                    type="button"
                    disabled={zoom <= 70}
                    onClick={() => setZoom((value) => Math.max(70, value - 10))}
                    aria-label={isChinese ? "缩小" : "Zoom out"}
                  >
                    <MagnifyingGlassMinus weight="bold" />
                  </button>
                  <button type="button" className="inline-case-fit" onClick={() => setZoom(100)}>
                    {zoom}%
                  </button>
                  <button
                    type="button"
                    disabled={zoom >= 160}
                    onClick={() => setZoom((value) => Math.min(160, value + 10))}
                    aria-label={isChinese ? "放大" : "Zoom in"}
                  >
                    <MagnifyingGlassPlus weight="bold" />
                  </button>
                  <button
                    type="button"
                    className="inline-case-fullscreen"
                    onClick={toggleFullscreen}
                    aria-pressed={isFullscreen}
                  >
                    {isFullscreen ? <ArrowsIn weight="bold" /> : <ArrowsOut weight="bold" />}
                    <span>{isFullscreen ? (isChinese ? "退出" : "EXIT") : (isChinese ? "全屏" : "FULL")}</span>
                  </button>
                </div>
              </div>

              <div className={`inline-case-viewer ${thumbnailsOpen ? "has-thumbnails" : "is-thumbnails-collapsed"}`}>
                <aside className="inline-case-thumbnails" aria-label={isChinese ? "页面缩略图" : "Page thumbnails"}>
                  {pages.map((page, index) => (
                    <button
                      key={page}
                      type="button"
                      className={activePage === index ? "is-active" : ""}
                      onClick={() => selectPage(index)}
                      aria-label={`${isChinese ? "第" : "Page"} ${index + 1}`}
                    >
                      <img
                        src={page}
                        alt=""
                        loading={index === activePage ? "eager" : "lazy"}
                        decoding="async"
                      />
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </button>
                  ))}
                </aside>

                <div className="inline-case-page-shell">
                  <div
                    ref={pageViewportRef}
                    className="inline-case-page-viewport"
                    tabIndex={0}
                    onScroll={syncActivePage}
                    onKeyDown={(event) => {
                      if (event.key === "PageUp") {
                        selectPage(activePage - 1);
                        event.preventDefault();
                      }
                      if (event.key === "PageDown") {
                        selectPage(activePage + 1);
                        event.preventDefault();
                      }
                    }}
                  >
                    <div className="inline-case-page-stack" style={{ width: `${zoom}%` }}>
                      {pages.map((page, index) => (
                        <figure
                          key={page}
                          ref={(node) => { pageRefs.current[index] = node; }}
                          data-page-index={index}
                          className={activePage === index ? "is-active" : ""}
                        >
                          <img
                            src={page}
                            alt={`${project.englishTitle} · ${isChinese ? "第" : "Page"} ${index + 1}`}
                            loading={index === activePage ? "eager" : "lazy"}
                            decoding="async"
                          />
                        </figure>
                      ))}
                    </div>
                  </div>
                  <div className="inline-case-reading-status" aria-live="polite">
                    {activePage + 1} / {pages.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className={`desktop-case-info ${project.slug === "daily-lazcash" ? "is-daily-lazcash" : ""} ${project.englishTitle.length <= 30 ? "is-compact-title" : ""}`}>
          <span>{project.index} / {project.year}</span>
          <h3>
            {project.englishTitle.includes(" / ")
              ? project.englishTitle.split(" / ").map((phrase) => (
                  <span className="case-title-phrase" key={phrase}>
                    {phrase}
                  </span>
                ))
              : project.englishTitle}
          </h3>
          <p>{project.englishCategory}</p>
          <button type="button" onClick={() => transitionTo(mode === "overview" ? "reader" : "overview")}>
            {mode === "overview" ? (
              <>{isChinese ? "查看完整案例" : "Read full case"}<ArrowUpRight weight="bold" /></>
            ) : (
              <><ArrowLeft weight="bold" />{isChinese ? "返回案例概览" : "Back to overview"}</>
            )}
          </button>
        </aside>
      </div>
    </div>
  );
}
