"use client";

/* eslint-disable @next/next/no-img-element -- Project screens and generated covers are local portfolio assets. */

import {
  Browser,
  CheckCircle,
  DeviceMobile,
  FilmStrip,
  Play,
  Sparkle,
} from "@phosphor-icons/react";
import { useState } from "react";
import { type LabProject } from "./labData";

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
        <iframe
          src={project.demoHref}
          title={`${project.title}互动 Demo`}
          sandbox="allow-scripts allow-same-origin allow-downloads"
        />
      </div>
      <div className="lab-embedded-panel" hidden={view !== "design"}>
        <LabProjectPreview project={{ ...project, demoHref: undefined }} />
      </div>
    </div>
  );
}

function ProjectStage({ project }: { project: LabProject }) {
  if ((project.mediaKind === "video" || project.mediaKind === "animation") && project.videoSrc) {
    return (
      <div className="lab-media-video">
        <video
          key={project.videoSrc}
          src={project.videoSrc}
          poster={project.cover}
          controls
          playsInline
          preload="metadata"
          aria-label={`${project.title}演示视频`}
        />
        <span><Play weight="fill" /> 点击播放完整演示</span>
      </div>
    );
  }

  const screens = project.screens?.length ? project.screens : [project.cover];

  if (project.mediaKind === "app") {
    return (
      <div className="lab-media-app">
        {screens.slice(0, 3).map((screen, index) => (
          <figure key={screen} className={index === 1 ? "is-primary" : ""}>
            <i aria-hidden="true" />
            <img src={screen} alt={`${project.title}界面 ${index + 1}`} />
          </figure>
        ))}
      </div>
    );
  }

  return (
    <div className="lab-media-browser">
      <div className="lab-browser-bar">
        <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
        <i>preview.local/{project.slug}</i>
      </div>
      <img src={screens[0]} alt={`${project.title}网页预览`} />
      {screens[1] ? <img className="lab-browser-secondary" src={screens[1]} alt={`${project.title}流程预览`} /> : null}
    </div>
  );
}

export function LabProjectPreview({ project }: { project: LabProject }) {
  if (project.demoHref) return <EmbeddedProject project={project} />;

  const MediaIcon = project.mediaKind === "app"
    ? DeviceMobile
    : project.mediaKind === "website"
      ? Browser
      : FilmStrip;

  return (
    <article className={`lab-project-preview accent-${project.accent}`}>
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
