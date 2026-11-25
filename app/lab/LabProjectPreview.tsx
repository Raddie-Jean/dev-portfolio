"use client";

/* eslint-disable @next/next/no-img-element -- Project screens and generated covers are local portfolio assets. */

import {
  Browser,
  CheckCircle,
  DeviceMobile,
  FilmStrip,
  Sparkle,
} from "@phosphor-icons/react";
import { type CSSProperties, type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { type LabProject } from "./labData";

const desktopViewport = { width: 1440, height: 900 };

function BrowserBar({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="lab-browser-bar">
      <div className="lab-browser-address">
        <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
        <i title={title}>{title}</i>
      </div>
      {children}
    </div>
  );
}

function PreviewZoom({ original, fit, onChange }: { original: boolean; fit: string; onChange: (original: boolean) => void }) {
  return (
    <div className="lab-browser-controls" role="group" aria-label="预览缩放">
      <button type="button" aria-pressed={!original} onClick={() => onChange(false)}>{fit}</button>
      <button type="button" aria-pressed={original} onClick={() => onChange(true)}>原始尺寸</button>
    </div>
  );
}

function DemoStage({ project }: { project: LabProject }) {
  const { width, height } = project.demoViewport ?? desktopViewport;
  const viewport = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0);
  const [original, setOriginal] = useState(false);
  const scale = original ? 1 : fitScale;

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const fit = (availableWidth: number, availableHeight: number) => {
      if (!availableWidth || !availableHeight) return;
      setFitScale(Math.min(1, availableWidth / width, availableHeight / height));
    };
    fit(element.clientWidth, element.clientHeight);
    const observer = new ResizeObserver(([entry]) => fit(entry.contentRect.width, entry.contentRect.height));
    observer.observe(element);
    return () => observer.disconnect();
  }, [height, width]);

  return (
    <div className="lab-demo-browser">
      <BrowserBar title={`桌面预览 · ${width} × ${height}`}>
        <PreviewZoom original={original} fit={`适应窗口 ${Math.round(fitScale * 100)}%`} onChange={setOriginal} />
      </BrowserBar>
      <div className="lab-demo-viewport" ref={viewport} tabIndex={0} aria-label="互动 Demo 浏览区">
        <div className="lab-demo-canvas" style={{ width: width * scale, height: height * scale }}>
          <iframe
            src={project.demoHref}
            title={`${project.title}互动 Demo`}
            sandbox={`allow-scripts allow-same-origin allow-downloads${project.demoExternalLinks ? " allow-popups" : ""}`}
            style={{ width, height, transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}

function EmbeddedProject({ project }: { project: LabProject }) {
  const [view, setView] = useState("demo");
  return (
    <div className="lab-embedded-project">
      <nav className="lab-embedded-toolbar" aria-label="案例内容">
        <strong>{project.title}</strong>
        <div>
          <button type="button" aria-pressed={view === "demo"} onClick={() => setView("demo")}>互动 Demo</button>
          <button type="button" aria-pressed={view === "design"} onClick={() => setView("design")}>设计详情</button>
        </div>
      </nav>
      <div className="lab-embedded-panel" hidden={view !== "demo"}>
        <DemoStage project={project} />
      </div>
      <div className="lab-embedded-panel" hidden={view !== "design"}>
        <ProjectDetails project={project} />
      </div>
    </div>
  );
}

function VideoStage({ project }: { project: LabProject }) {
  const [ratio, setRatio] = useState(16 / 9);
  return (
    <div className="lab-video-stage">
      <div className="lab-media-video" style={{ "--lab-video-ratio": ratio } as CSSProperties}>
        <video
          src={project.videoSrc}
          poster={project.cover}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={({ currentTarget: video }) => {
            if (video.videoWidth && video.videoHeight) setRatio(video.videoWidth / video.videoHeight);
          }}
          aria-label={`${project.title}演示视频`}
        />
      </div>
    </div>
  );
}

function ScreenshotStage({ project }: { project: LabProject }) {
  const screens = project.screens?.length ? project.screens : [project.cover];
  const [activeIndex, setActiveIndex] = useState(0);
  const [original, setOriginal] = useState(false);
  const label = (index: number) => project.screenLabels?.[index] ?? (project.screens?.length ? `界面 ${index + 1}` : "项目封面");
  return (
    <div className="lab-media-browser">
      <BrowserBar title={label(activeIndex)}>
        <PreviewZoom original={original} fit="适应窗口" onChange={setOriginal} />
      </BrowserBar>
      {screens.length > 1 && (
        <div className="lab-browser-controls lab-screen-select" role="group" aria-label="选择界面">
          {screens.map((screen, index) => (
            <button key={screen} type="button" aria-pressed={activeIndex === index} onClick={() => setActiveIndex(index)}>{label(index)}</button>
          ))}
        </div>
      )}
      <div key={activeIndex} className={`lab-still-viewport${original ? " is-original" : ""}`} tabIndex={0} aria-label={label(activeIndex)}>
        <img src={screens[activeIndex]} alt={`${project.title} · ${label(activeIndex)}`} />
      </div>
    </div>
  );
}

function ProjectStage({ project }: { project: LabProject }) {
  if (project.videoSrc) return <VideoStage project={project} />;

  if (project.phoneScreens?.length) {
    return (
      <div className="lab-media-app" tabIndex={0} aria-label={`${project.title} · 手机界面，可滚动查看`}>
        <div className="lab-phone-track">
          {project.phoneScreens.map(({ src, label }) => (
            <figure key={src}>
              <div className="lab-phone-screen"><img src={src} alt={`${project.title} · ${label}`} /></div>
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    );
  }

  return <ScreenshotStage project={project} />;
}

function ProjectDetails({ project }: { project: LabProject }) {
  const stage = project.videoSrc ? "video" : project.phoneScreens?.length ? "phones" : "stills";
  const MediaIcon = project.mediaKind === "app"
    ? DeviceMobile
    : project.mediaKind === "website"
      ? Browser
      : FilmStrip;

  return (
    <article className={`lab-project-preview accent-${project.accent} has-${stage}`}>
      <div className="lab-project-main">
        <header className="lab-project-header">
          <div>
            <p><Sparkle weight="fill" /> {project.year} / {project.mediaLabel}</p>
            <h2>{project.title}</h2>
            <span>{project.category}</span>
          </div>
          <MediaIcon weight="duotone" aria-hidden="true" />
        </header>

        <ProjectStage project={project} />
      </div>

      <aside className="lab-project-notes">
        <section>
          <p className="lab-note-label">PROJECT NOTE / 项目说明</p>
          <strong>{project.summary}</strong>
        </section>

        <section>
          <p className="lab-note-label">PROCESS / 我怎么做</p>
          <ol>
            {project.process.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </section>

        <section className="lab-reflection-note">
          <p className="lab-note-label">REFLECTION / 复盘</p>
          <p>{project.reflection}</p>
        </section>

        <section>
          <p className="lab-note-label">OUTPUTS / 产出</p>
          <ul>
            {project.outcomes.map((item) => (
              <li key={item}><CheckCircle weight="fill" /> {item}</li>
            ))}
          </ul>
        </section>
      </aside>
    </article>
  );
}

export function LabProjectPreview({ project }: { project: LabProject }) {
  return project.demoHref ? <EmbeddedProject project={project} /> : <ProjectDetails project={project} />;
}
