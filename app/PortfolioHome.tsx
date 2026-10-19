"use client";

/* eslint-disable @next/next/no-img-element -- Vinext's local image optimizer cannot serve these bundled assets. */

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  ChatCircleDots,
  DeviceMobile,
  DownloadSimple,
  FilePdf,
  FolderOpen,
  House,
  List,
  MusicNotes,
  Pause,
  Play,
  RocketLaunch,
  SpeakerHigh,
  SpeakerSlash,
  Star,
  User,
  VideoCamera,
  X,
} from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { featuredCaseStudies } from "./caseData";
import { DesktopWindow } from "./DesktopWindow";
import { DraggableCard } from "./DraggableCard";
import { InlineCaseDocumentViewer } from "./InlineCaseDocumentViewer";
import { MusicPlayer } from "./MusicPlayer";
import { SmokyText } from "./SmokyText";
import { usePortfolioLanguage } from "./usePortfolioLanguage";
import { MobileDemoPreview, VideoWorkPreview } from "./WorkMediaPreview";

gsap.registerPlugin(ScrollTrigger);

const GalleryTunnel = dynamic(
  () => import("./GalleryTunnel").then((module) => module.GalleryTunnel),
  {
    ssr: false,
    loading: () => (
      <div className="gallery-loading" role="status">
        正在布置画廊…
      </div>
    ),
  },
);

const subscribeToMobileBreakpoint = (onChange: () => void) => {
  const mediaQuery = window.matchMedia("(max-width: 700px)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};

const getMobileBreakpointSnapshot = () =>
  window.matchMedia("(max-width: 700px)").matches;

const getMobileBreakpointServerSnapshot = () => true;

const sceneIds = ["home", "about", "work", "skills", "gallery"] as const;
type HomePhase = "loading" | "opening";

const galleryStars = Array.from({ length: 28 }, (_, index) => ({
  left: `${(index * 37 + 11) % 97}%`,
  top: `${(index * 53 + 7) % 93}%`,
  size: `${index % 7 === 0 ? 4 : index % 3 === 0 ? 3 : 2}px`,
  delay: `${-(index * 1.37) % 9}s`,
  duration: `${4 + (index % 6) * 0.8}s`,
}));

const galleryArtworkMeta = [
  { width: 2197, height: 2551, alt: "A family discovering a spaceship in a park" },
  { width: 2197, height: 2551, alt: "A young explorer looking across the water toward a boat" },
  { width: 2197, height: 2551, alt: "Three children riding through the clouds on a green dragon" },
  { width: 2197, height: 2551, alt: "A mouse using a computer while a surprised woman enters the room" },
  { width: 6928, height: 4267, alt: "Animal friends visiting a pottery market in a sunny garden" },
  { width: 6928, height: 4267, alt: "Playful fruit characters gathered in a glowing fruit garden" },
  { width: 6732, height: 8622, alt: "Animal Forest illustration with woodland characters" },
  { width: 6732, height: 8622, alt: "Underwater World illustration with a whale and colorful sea life" },
  { width: 6732, height: 8622, alt: "A quiet rabbit home surrounded by a soft painted forest" },
  { width: 15868, height: 4407, alt: "A panoramic illustration of a traditional rice noodle shop" },
  { width: 4961, height: 3617, alt: "An opera-inspired girl surrounded by oranges and garden scenery" },
  { width: 3884, height: 5144, alt: "A white fox spirit resting beside a small flame" },
  { width: 2480, height: 3507, alt: "Ningbo Maritime Silk Road inspired character illustration" },
  { width: 1456, height: 2048, alt: "A fantasy adventurer posing with three dog companions" },
  { width: 1536, height: 2048, alt: "Raddie exploring a warm felted space garden" },
] as const;

const galleryImages = galleryArtworkMeta.map((artwork, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    ...artwork,
    src: `/gallery/tunnel/artwork-${number}.jpg`,
    thumbSrc: `/gallery/thumb/artwork-${number}.jpg`,
    fullSrc: `/gallery/full/artwork-${number}.jpg`,
    label: `ILLUSTRATION ${number}`,
  };
});

const motionActivities = [
  {
    id: "raddie-opening",
    title: "Raddie Opening Motion",
    label: "OPENING MOTION",
    src: "/assets/work-media/ip-animation.mp4",
    poster: "/assets/ip/luobogou/hero-still.png",
  },
  {
    id: "mini-game-demo",
    title: "Mini Game Demo",
    label: "GAME DESIGN",
    src: "/assets/work-media/mini-game-demo.mp4",
  },
  {
    id: "dance-plus",
    title: "Dance+",
    label: "DANCE EXPERIENCE",
    src: "/assets/work-media/dance-plus.mp4",
  },
  {
    id: "credit-growth",
    title: "Credit Back / Win Credit",
    label: "CREDIT ACTIVITIES",
    poster: "/cases/projects/credit-activity/cover-16x9.png",
  },
  {
    id: "balance-upgrade",
    title: "Balance 2.0",
    label: "BALANCE ACTIVITY",
    poster: "/cases/projects/balance-activity/cover-16x9.png",
  },
  {
    id: "daily-lazcash",
    title: "Daily LazCash",
    label: "RESEARCH ASSISTANT",
    src: "/assets/work-media/daily-lazcash/daily-lazcash-demo.mp4",
    background: "/assets/work-media/daily-lazcash/daily-lazcash-sky-background.png",
  },
] as const;

const mobileDemoProjects = [
  {
    id: "mini-game-demo",
    title: "Mini Game Demo",
    label: "GAME DESIGN",
    videoSrc: "/assets/work-media/mini-game-demo.mp4",
  },
  {
    id: "daily-lazcash",
    title: "Daily LazCash",
    label: "RESEARCH ASSISTANT",
    videoSrc: "/assets/work-media/daily-lazcash/daily-lazcash-demo.mp4",
  },
] as const;

const homeTrailImages = [
  "/assets/ip/luobogou/props/vegetables/carrot.png",
  "/assets/ip/luobogou/props/vegetables/strawberry.png",
  "/assets/ip/luobogou/props/vegetables/apple.png",
  "/assets/ip/luobogou/props/vegetables/orange.png",
  "/assets/ip/luobogou/props/vegetables/mushroom.png",
  "/assets/ip/luobogou/props/vegetables/broccoli.png",
  "/assets/ip/luobogou/props/vegetables/peach.png",
  "/assets/ip/luobogou/props/vegetables/peas.png",
  "/assets/ip/luobogou/props/vegetables/radish.png",
  "/assets/ip/luobogou/props/vegetables/lettuce.png",
  "/assets/ip/luobogou/props/vegetables/cabbage.png",
  "/assets/ip/luobogou/props/vegetables/bok-choy.png",
  "/assets/home/trail/mushroom-cream.png",
  "/assets/home/trail/leaf-single.png",
  "/assets/home/trail/herb-sprig.png",
  "/assets/home/trail/leaf-romaine.png",
] as const;

const copy = {
  zh: {
    nav: ["首页", "关于", "作品", "能力", "画廊"],
    available: "可参与新机会",
    heroKicker: "JEAN'S EXPERIENCE DESIGN DESKTOP",
    heroTitle: "Making complex things feel a little more natural.",
    heroBody:
      "嗨，我是体验设计师 Jean，关注增长设计、AI 与跨端体验。欢迎来到我的数字小世界。",
    explore: "关于我",
    introTitle: "欢迎来到我的桌面",
    introBody: "Now running: curiosity, structured thinking, and a quietly stubborn care for detail.",
    chatTitle: "萝卜狗在线",
    chatGreeting: "嗨，我是萝卜狗。今天想看 Jean 的作品，还是先摸摸鱼？",
    chatPlaceholder: "和萝卜狗说点什么…",
    chatReply: "收到！这个版本先由我值班，正式版会接入更完整的对话。",
    aboutKicker: "SCENE 02 / ABOUT JEAN",
    aboutBody: "",
    introHeading: "Jean",
    introCopy: "增长体验设计师｜AI 产品设计｜用户研究",
    ipHeading: "Meet Raddie",
    ipCopy: "白萝卜特征的比熊数字生命伙伴Raddie，也是我练习叙事与情绪设计的长期成长陪伴型IP。",
    designHeading: "我对设计的理解",
    designCopy: "设计不是把信息装饰得更满，而是建立判断、组织证据，让复杂系统变得清晰、可信、有人情味。",
    experienceHeading: "工作经历",
    educationHeading: "教育经历",
    messageTitle: "VISITOR_MESSAGE.EXE",
    messagePlaceholder: "留下一句话…",
    messageSend: "贴到留言板",
    workKicker: "SCENE 03 / WORK ARCHIVE",
    workTitle: "Reviewing past cases",
    workBody: "Constantly refining myself and documenting my growth.",
    openCase: "阅读完整案例",
    otherWorks: "更多案例",
    skillsKicker: "SCENE 04 / DESIGN CAPABILITY MAP",
    skillsTitle: "Skill Map",
    skillsBody: "From insight and growth to AI collaboration, this map shows how I turn complex problems into testable experiences.",
    galleryKicker: "SCENE 05 / ILLUSTRATION ORBIT",
    galleryTitle: "A World in Bloom",
    galleryBody: "Where images meet endless possibilities",
    resume: "查看简历",
    resumeTitle: "JEAN_RESUME.PREVIEW",
    resumeRole: "Experience Designer",
    resumeLine: "增长设计 · 服务设计 · AI 产品 · 跨端体验",
    contact: "和我聊聊",
    skillCloud: [
      "UX Design",
      "Interaction Design",
      "Growth Design",
      "User Research",
      "Usability Testing",
      "Information Architecture",
      "User Journey",
      "Conversion Funnel",
      "Behavioral Design",
      "A/B Testing",
      "Data Analysis",
      "Design System",
      "AI Workflow",
      "Prompt Engineering",
      "Vibe Coding",
      "Figma",
      "ChatGPT + Codex",
      "Cross-functional Collaboration",
    ],
    skillGroups: [
      ["01", "Strategy & Growth", "Conversion Funnel · Behavioral Design · A/B Testing"],
      ["02", "UX & Research", "Interaction Design · User Journey · Usability Testing · NPS"],
      ["03", "AI Design Workflow", "ChatGPT + Codex · Claude · Cursor · Qoder · OpenClaw"],
      ["04", "Visual & Delivery", "Figma · Design System · Visual Storytelling · Cross-functional Collaboration"],
    ],
  },
  en: {
    nav: ["Home", "About", "Work", "Skills", "Gallery"],
    available: "Available for opportunities",
    heroKicker: "JEAN'S EXPERIENCE DESIGN DESKTOP",
    heroTitle: "Making complex things feel a little more natural.",
    heroBody:
      "Experience designer working across growth, AI, and connected products. This is also Raddie's small digital world. Drag a window and look around.",
    explore: "Meet me",
    introTitle: "Welcome to my desktop",
    introBody: "Now running: curiosity, structured thinking, and a quietly stubborn care for detail.",
    chatTitle: "Raddie is online",
    chatGreeting: "Hi, I am Raddie. Shall we see Jean's work or take a tiny break first?",
    chatPlaceholder: "Say something…",
    chatReply: "Got it. I am on duty for this preview; the full version will have a richer conversation.",
    aboutKicker: "SCENE 02 / ABOUT JEAN",
    aboutBody: "",
    introHeading: "Jean",
    introCopy: "Growth Experience Design | AI Product Design | User Research",
    ipHeading: "Meet Raddie",
    ipCopy:
      "Part bichon, part white radish, and my long-term IP for exploring narrative, motion, and emotional design.",
    designHeading: "What design means to me",
    designCopy:
      "Design is not adding more decoration. It is building judgment, organizing evidence, and making complex systems clear, credible, and humane.",
    experienceHeading: "Experience",
    educationHeading: "Education",
    messageTitle: "VISITOR_MESSAGE.EXE",
    messagePlaceholder: "Leave a note…",
    messageSend: "Pin message",
    workKicker: "SCENE 03 / WORK ARCHIVE",
    workTitle: "Reviewing past cases",
    workBody: "Constantly refining myself and documenting my growth.",
    openCase: "Read full case",
    otherWorks: "More cases",
    skillsKicker: "SCENE 04 / DESIGN CAPABILITY MAP",
    skillsTitle: "Skill Map",
    skillsBody: "From insight and growth to AI collaboration, this map shows how I turn complex problems into testable experiences.",
    galleryKicker: "SCENE 05 / ILLUSTRATION ORBIT",
    galleryTitle: "A World in Bloom",
    galleryBody: "Where images meet endless possibilities",
    resume: "View resume",
    resumeTitle: "JEAN_RESUME.PREVIEW",
    resumeRole: "Experience Designer",
    resumeLine: "Growth · Service Design · AI Products · Connected Experiences",
    contact: "Let's talk",
    skillCloud: [
      "UX Design",
      "Interaction Design",
      "Growth Design",
      "User Research",
      "Usability Testing",
      "Information Architecture",
      "User Journey",
      "Conversion Funnel",
      "Behavioral Design",
      "A/B Testing",
      "Data Analysis",
      "Design System",
      "AI Workflow",
      "Prompt Engineering",
      "Vibe Coding",
      "Figma",
      "ChatGPT + Codex",
      "Cross-functional Collaboration",
    ],
    skillGroups: [
      ["01", "Strategy & Growth", "Conversion Funnel · Behavioral Design · A/B Testing"],
      ["02", "UX & Research", "Interaction Design · User Journey · Usability Testing · NPS"],
      ["03", "AI Design Workflow", "ChatGPT + Codex · Claude · Cursor · Qoder · OpenClaw"],
      ["04", "Visual & Delivery", "Figma · Design System · Visual Storytelling · Cross-functional Collaboration"],
    ],
  },
} as const;

export default function PortfolioHome() {
  const panelsRef = useRef<HTMLDivElement>(null);
  const aboutBoardRef = useRef<HTMLDivElement>(null);
  const workDockRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const homeLoadingTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const { language } = usePortfolioLanguage();
  const text = copy[language];
  const isMobileViewport = useSyncExternalStore(
    subscribeToMobileBreakpoint,
    getMobileBreakpointSnapshot,
    getMobileBreakpointServerSnapshot,
  );
  const [activeScene, setActiveScene] = useState(0);
  const [activeCase, setActiveCase] = useState(0);
  const [homePhase, setHomePhase] = useState<HomePhase>("loading");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [introOpen, setIntroOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [caseOpen, setCaseOpen] = useState(true);
  const [motionOpen, setMotionOpen] = useState(false);
  const [mobileDemoOpen, setMobileDemoOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeView, setResumeView] = useState<"overview" | "document">("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTouched, setMessageTouched] = useState(false);
  const [workLayerTransitioning, setWorkLayerTransitioning] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<string[]>([text.chatGreeting]);
  const [guestInput, setGuestInput] = useState("");
  const [guestMessages, setGuestMessages] = useState<string[]>([
    language === "zh" ? "欢迎来到 Jean 的数字世界 ✦" : "Welcome to Jean's digital world ✦",
  ]);
  const [topWindow, setTopWindow] = useState("intro");
  const [topCard, setTopCard] = useState("design");
  const selectedCase =
    featuredCaseStudies[activeCase] ?? featuredCaseStudies[0];
  const messageVisible = messageOpen && (!isMobileViewport || messageTouched);

  useLayoutEffect(() => {
    if (activeScene === 0) return;
    const root = panelsRef.current;
    const sceneName = sceneIds[activeScene];
    const scene = root?.querySelector<HTMLElement>(`[data-scene="${sceneName}"]`);
    if (!scene) return;

    const titleSelectors: Record<(typeof sceneIds)[number], string> = {
      home: ".desktop-hero-copy h1, .desktop-hero-meta > p",
      about: ".about-heading > p",
      work: ".work-heading > p, .work-heading > h2, .work-heading > span",
      skills: ".desktop-skill-kicker, .desktop-skill-title-row h2, .desktop-skill-summary",
      gallery: ".gallery-heading > p, .gallery-heading > h2, .gallery-heading > span",
    };
    const moduleSelectors: Record<(typeof sceneIds)[number], string> = {
      home: ".desktop-intro-window, .desktop-chat-window, .desktop-icon-stack-home",
      about: ".about-canvas, .about-message-window, .desktop-icon-stack-about",
      work: ".desktop-case-window, .desktop-motion-window, .desktop-mobile-demo-window, .desktop-work-dock, .desktop-icon-stack-work",
      skills: ".desktop-skill-map-block, .desktop-skill-board, .desktop-resume-window, .desktop-icon-stack-skills",
      gallery: ".gallery-tunnel, .desktop-footer",
    };
    const titleElements = Array.from(
      scene.querySelectorAll<HTMLElement>(titleSelectors[sceneName]),
    );
    const moduleElements = Array.from(
      document.querySelectorAll<HTMLElement>(moduleSelectors[sceneName]),
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const modulesAppearImmediately = sceneName === "about" || sceneName === "gallery";
    const titleDuration = sceneName === "gallery" ? 0.92 : 0.58;
    const titleStagger = sceneName === "gallery" ? 0.17 : 0.11;

    const context = gsap.context(() => {
      gsap.killTweensOf([...titleElements, ...moduleElements]);
      if (reducedMotion) {
        gsap.set([...titleElements, ...moduleElements], {
          autoAlpha: 1,
          clearProps: "transform,filter,opacity,visibility",
        });
        return;
      }

      if (modulesAppearImmediately) {
        gsap.set(moduleElements, {
          autoAlpha: 1,
          clearProps: "opacity,visibility",
        });
      }

      const timeline = gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          titleElements,
          { autoAlpha: 0, y: 22, filter: "blur(7px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: titleDuration,
            stagger: titleStagger,
            clearProps: "transform,filter,opacity,visibility",
          },
        );

      if (!modulesAppearImmediately) {
        timeline.fromTo(
          moduleElements,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.5,
            stagger: 0.08,
            clearProps: "opacity,visibility",
          },
          ">",
        );
      }
    }, scene);

    return () => context.revert();
  }, [activeScene, language]);

  useEffect(() => {
    const dock = workDockRef.current;
    if (!dock) return;
    const cards = Array.from(dock.querySelectorAll<HTMLElement>("[data-work-dock-card]"));
    const media = gsap.matchMedia();
    media.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      const cleanups = cards.map((card) => {
        const enter = () => {
          gsap.killTweensOf(card);
          gsap.to(card, { y: -9, scale: 1.055, duration: 0.28, ease: "power3.out" });
        };
        const leave = () => {
          gsap.killTweensOf(card);
          gsap.to(card, { y: 0, scale: 1, duration: 0.24, ease: "power2.out" });
        };
        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
        card.addEventListener("focusin", enter);
        card.addEventListener("focusout", leave);
        return () => {
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
          card.removeEventListener("focusin", enter);
          card.removeEventListener("focusout", leave);
        };
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    });
    return () => media.revert();
  }, []);

  useEffect(() => {
    const root = panelsRef.current;
    if (!root) return;
    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cardRadius = `${Math.min(64, Math.max(36, window.innerWidth * 0.045))}px`;

    const context = gsap.context(() => {
      panels.slice(0, -1).forEach((panel) => {
        if (reducedMotion) return;
        gsap
          .timeline({
            scrollTrigger: {
              trigger: panel,
              start: "top top",
              end: "bottom top",
              pin: true,
              pinSpacing: false,
              scrub: true,
            },
          })
          .to(panel, {
            scale: 0.91,
            borderRadius: cardRadius,
            autoAlpha: 0.52,
            duration: 0.86,
            ease: "none",
          })
          .to(panel, {
            autoAlpha: 0,
            duration: 0.14,
            ease: "none",
          });
      });

      panels.slice(1).forEach((panel) => {
        if (reducedMotion) return;
        gsap.fromTo(
          panel,
          { scale: 0.965, borderRadius: cardRadius },
          {
            scale: 1,
            borderRadius: "0px",
            ease: "power2.in",
            scrollTrigger: {
              trigger: panel,
              start: "top 25%",
              end: "top top",
              scrub: true,
            },
          },
        );
      });

      panels.forEach((panel, index) => {
        ScrollTrigger.create({
          trigger: panel,
          start: "top 52%",
          end: "bottom 48%",
          onEnter: () => setActiveScene(index),
          onEnterBack: () => setActiveScene(index),
        });
      });

      const workPanel = panels[2];
      if (workPanel && !reducedMotion) {
        gsap.fromTo(
          document.documentElement,
          { "--work-window-scene-y": "100vh" },
          {
            "--work-window-scene-y": "0vh",
            ease: "none",
            scrollTrigger: {
              trigger: workPanel,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          },
        );
      }

      const skillsPanel = panels[3];
      if (skillsPanel && !reducedMotion) {
        gsap.fromTo(
          document.documentElement,
          { "--work-window-cover": "0%" },
          {
            "--work-window-cover": "100%",
            ease: "none",
            scrollTrigger: {
              trigger: skillsPanel,
              start: "top bottom",
              end: "top top",
              scrub: true,
              onEnter: () => setWorkLayerTransitioning(true),
              onLeave: () => setWorkLayerTransitioning(false),
              onEnterBack: () => setWorkLayerTransitioning(true),
              onLeaveBack: () => setWorkLayerTransitioning(false),
            },
          },
        );
      }
    }, root);

    const initialHash = window.location.hash.replace("#", "");
    const initialIndex = sceneIds.indexOf(initialHash as (typeof sceneIds)[number]);
    let initialScrollTimer: number | undefined;
    if (initialIndex >= 0) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
      window.scrollTo({ top: 0 });
      initialScrollTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => {
          const targetTop = panels
            .slice(0, initialIndex)
            .reduce((total, panel) => total + panel.offsetHeight, 0);
          window.scrollTo({ top: targetTop });
          window.history.replaceState(
            null,
            "",
            `#${sceneIds[initialIndex]}`,
          );
          setActiveScene(initialIndex);
        });
      }, 250);
    }

    return () => {
      if (initialScrollTimer) window.clearTimeout(initialScrollTimer);
      context.revert();
    };
  }, []);

  useEffect(() => {
    const home = panelsRef.current?.querySelector<HTMLElement>("[data-scene='home']");
    if (!home) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set([".home-theme-title", ".home-loading-card"], { autoAlpha: 1 });
        gsap.set(".home-loading-progress i", { width: "100%" });
        gsap.set(".home-loading-ok", { scale: 1 });
        return;
      }

      const timeline = gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          ".home-theme-title",
          { autoAlpha: 0, y: 24, scale: 0.92, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.9 },
        )
        .fromTo(
          ".home-loading-card",
          { autoAlpha: 0, y: 18, scale: 0.94 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            clearProps: "transform",
          },
          "-=0.28",
        )
        .fromTo(
          ".home-loading-progress i",
          { width: "8%" },
          {
            width: "100%",
            duration: 2.1,
            ease: "steps(14)",
          },
          ">-0.04",
        );
      homeLoadingTimelineRef.current = timeline;
    }, home);

    return () => {
      homeLoadingTimelineRef.current = null;
      context.revert();
    };
  }, []);

  useEffect(() => {
    if (homePhase !== "opening") return;
    const home = panelsRef.current?.querySelector<HTMLElement>("[data-scene='home']");
    if (!home) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (reducedMotion) {
        timeline
          .set([".home-theme-title", ".home-loading-card"], { autoAlpha: 0 })
          .set(".desktop-hero-copy", { autoAlpha: 1 });
        return;
      }

      timeline
        .to(".home-loading-card", {
          autoAlpha: 0,
          y: 12,
          scale: 0.96,
          duration: 0.24,
          ease: "power2.in",
        })
        .to(
          ".home-theme-title",
          {
            autoAlpha: 0,
            scale: 1.05,
            filter: "blur(12px)",
            duration: 0.55,
            ease: "power2.in",
          },
          "-=0.04",
        )
        .fromTo(
          ".desktop-hero-copy",
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.46 },
          "-=0.12",
        );
    }, home);

    const playTimer = window.setTimeout(() => {
      videoRef.current?.play().catch(() => setVideoPlaying(false));
    }, reducedMotion ? 0 : 720);

    return () => {
      window.clearTimeout(playTimer);
      context.revert();
    };
  }, [homePhase]);

  useEffect(() => {
    if (!introOpen || homePhase !== "opening") return;
    const home = panelsRef.current?.querySelector<HTMLElement>("[data-scene='home']");
    if (!home) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(".desktop-intro-window", { autoAlpha: 1 });
        return;
      }

      gsap.fromTo(
        ".desktop-intro-window",
        { autoAlpha: 0, y: 42, scale: 0.9 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.58,
          ease: "back.out(1.3)",
          clearProps: "transform",
        },
      );
    }, home);

    return () => context.revert();
  }, [homePhase, introOpen]);

  useEffect(() => {
    if (!chatOpen) return;
    const home = panelsRef.current?.querySelector<HTMLElement>("[data-scene='home']");
    if (!home) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(".desktop-chat-window", { autoAlpha: 1 });
        return;
      }
      gsap.fromTo(
        ".desktop-chat-window",
        { autoAlpha: 0, y: 32, scale: 0.9 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.58,
          ease: "back.out(1.45)",
          clearProps: "transform",
        },
      );
    }, home);

    return () => context.revert();
  }, [chatOpen]);

  useEffect(() => {
    const home = panelsRef.current?.querySelector<HTMLElement>("[data-scene='home']");
    if (!home) return;
    if (homePhase !== "loading") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reducedMotion || !finePointer) return;

    let previousX: number | null = null;
    let previousY: number | null = null;
    let distance = 0;
    let imageIndex = 0;
    const activeImages = new Set<HTMLImageElement>();
    const activeTweens = new Map<HTMLImageElement, gsap.core.Timeline>();

    const removeImage = (image: HTMLImageElement) => {
      activeTweens.get(image)?.kill();
      activeTweens.delete(image);
      activeImages.delete(image);
      image.remove();
    };

    const createTrailImage = (
      x: number,
      y: number,
      deltaX: number,
      deltaY: number,
    ) => {
      if (activeImages.size >= 16) {
        const oldest = activeImages.values().next().value;
        if (oldest) {
          removeImage(oldest);
        }
      }

      const image = document.createElement("img");
      const trajectorySpeed = Math.min(1, Math.hypot(deltaX, deltaY) / 72);
      const size = 44 + trajectorySpeed * 22 + Math.random() * 8;
      const driftX = Math.max(-72, Math.min(72, deltaX * 1.8));
      const startY = Math.min(y, home.clientHeight - size / 2 - 48);
      const groundY = Math.max(96, home.clientHeight - size / 2 - 18);
      const landingX = Math.max(
        size / 2 + 12,
        Math.min(home.clientWidth - size / 2 - 12, x + driftX),
      );
      const fallDuration = Math.max(0.38, Math.min(0.76, (groundY - startY) / 720));
      const rotation = (Math.random() - 0.5) * 42;
      const bounceHeight = 13 + trajectorySpeed * 9;
      const squashX = 1.045 + trajectorySpeed * 0.035;
      const squashY = 0.955 - trajectorySpeed * 0.025;
      image.src = homeTrailImages[imageIndex];
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      image.className = "home-produce-trail";
      image.style.width = `${size}px`;
      home.appendChild(image);
      activeImages.add(image);

      const animation = gsap.timeline({ onComplete: () => removeImage(image) });
      animation
        .set(image, {
          autoAlpha: 0,
          x,
          y: startY,
          xPercent: -50,
          yPercent: -50,
          scale: 0.62,
          rotation: -rotation * 0.55,
        })
        .to(image, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.16,
          ease: "back.out(1.4)",
        })
        .to(image, {
          x: landingX,
          y: groundY,
          rotation,
          duration: fallDuration,
          ease: "power2.in",
        })
        .to(image, {
          scaleX: squashX,
          scaleY: squashY,
          duration: 0.075,
          ease: "power1.out",
        })
        .to(image, {
          y: groundY - bounceHeight,
          scaleX: 0.985,
          scaleY: 1.025,
          rotation: rotation * 0.78,
          duration: 0.16,
          ease: "power2.out",
        })
        .to(image, {
          y: groundY,
          scaleX: 1,
          scaleY: 1,
          rotation: rotation * 0.92,
          duration: 0.17,
          ease: "power2.in",
        })
        .to(image, {
          autoAlpha: 0,
          y: groundY + 12,
          scale: 0.92,
          duration: 0.28,
          delay: 0.34,
          ease: "power1.in",
        });
      activeTweens.set(image, animation);
      imageIndex = (imageIndex + 1) % homeTrailImages.length;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest(".desktop-window, .desktop-icon-stack, button, a, input")) {
        previousX = null;
        previousY = null;
        distance = 0;
        return;
      }

      const bounds = home.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      if (x < 0 || x > bounds.width || y < 0 || y > bounds.height) return;
      if (previousX === null || previousY === null) {
        previousX = x;
        previousY = y;
        return;
      }

      const deltaX = x - previousX;
      const deltaY = y - previousY;
      distance += Math.abs(deltaX) + Math.abs(deltaY);
      if (distance >= 74) {
        distance = 0;
        createTrailImage(x, y, deltaX, deltaY);
      }
      previousX = x;
      previousY = y;
    };

    const resetPointer = () => {
      previousX = null;
      previousY = null;
      distance = 0;
    };

    home.addEventListener("pointermove", handlePointerMove, { passive: true });
    home.addEventListener("pointerleave", resetPointer);
    return () => {
      home.removeEventListener("pointermove", handlePointerMove);
      home.removeEventListener("pointerleave", resetPointer);
      activeImages.forEach((image) => {
        activeTweens.get(image)?.kill();
        image.remove();
      });
      activeTweens.clear();
      activeImages.clear();
    };
  }, [homePhase]);

  const scrollToScene = (index: number) => {
    const id = sceneIds[index];
    const panels = Array.from(
      document.querySelectorAll<HTMLElement>(".desktop-scene"),
    );
    if (!panels[index]) return;
    const targetTop = panels
      .slice(0, index)
      .reduce((total, panel) => total + panel.offsetHeight, 0);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  const startHomeIntro = () => {
    if (homePhase !== "loading") return;
    homeLoadingTimelineRef.current?.kill();
    setChatOpen(false);
    setIntroOpen(true);
    setTopWindow("intro");
    setHomePhase("opening");
  };

  const reopenIntroWindow = () => {
    setIntroOpen(true);
    setTopWindow("intro");
    setVideoProgress(0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = 0;
        video.play().catch(() => setVideoPlaying(false));
      });
    });
  };

  const closeIntroWindow = () => {
    videoRef.current?.pause();
    setVideoPlaying(false);
    setIntroOpen(false);
  };

  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (video.ended) {
        video.currentTime = 0;
        setVideoProgress(0);
      }
      await video.play();
    } else {
      video.pause();
    }
  };

  const sendMessage = () => {
    const nextMessage = chatInput.trim();
    if (!nextMessage) return;
    setMessages((current) => [...current, nextMessage, text.chatReply]);
    setChatInput("");
  };

  const sendGuestMessage = () => {
    const nextMessage = guestInput.trim();
    if (!nextMessage) return;
    setGuestMessages((current) => [...current, nextMessage]);
    setGuestInput("");
  };

  const windowZ = (id: string) => (topWindow === id ? 160 : 120);
  const cardZ = (id: string) => (topCard === id ? 36 : 12);

  return (
    <main className="desktop-portfolio">
      <header className="desktop-nav">
        <div className="desktop-nav-pill">
          <button
            type="button"
            className="desktop-brand"
            onClick={() => {
              setNavOpen(false);
              scrollToScene(0);
            }}
            aria-label={language === "zh" ? "返回首页" : "Back to home"}
          >
            <img className="desktop-brand-logo" src="/assets/home/jean-logo.png" alt="Jean" />
          </button>

          <nav className="desktop-nav-links" aria-label="Portfolio sections">
            {text.nav.map((item, index) => (
              <button
                type="button"
                key={item}
                className={activeScene === index ? "is-active" : ""}
                onClick={() => scrollToScene(index)}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="desktop-nav-actions">
            <a className="desktop-nav-cta" href="mailto:jeanzhou.design@outlook.com">
              <span>{text.contact}</span>
              <i aria-hidden="true"><ArrowRight weight="bold" /></i>
            </a>
            <button
              type="button"
              className="desktop-nav-menu-button"
              onClick={() => setNavOpen((current) => !current)}
              aria-expanded={navOpen}
              aria-controls="portfolio-mobile-menu"
              aria-label={language === "zh" ? "打开导航" : "Toggle navigation"}
            >
              {navOpen ? <X weight="bold" /> : <List weight="bold" />}
            </button>
          </div>

          {navOpen && (
            <nav id="portfolio-mobile-menu" className="desktop-mobile-menu" aria-label="Mobile portfolio sections">
              {text.nav.map((item, index) => (
                <button
                  type="button"
                  key={item}
                  className={activeScene === index ? "is-active" : ""}
                  onClick={() => {
                    setNavOpen(false);
                    scrollToScene(index);
                  }}
                >
                  <span>0{index + 1}</span>
                  {item}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <div className="desktop-scene-progress" aria-label="Scene navigation">
        {text.nav.map((item, index) => (
          <button
            type="button"
            key={item}
            className={activeScene === index ? "is-active" : ""}
            onClick={() => scrollToScene(index)}
            aria-label={item}
          >
            <span />
          </button>
        ))}
      </div>

      <div ref={panelsRef} className="desktop-panels">
        <section
          id="home"
          className={`desktop-scene desktop-scene-home home-phase-${homePhase} ${activeScene === 0 ? "is-active-scene" : ""}`}
          data-scene="home"
        >
          <img
            className="desktop-scene-bg"
            src="/assets/home/intro-background.png"
            alt=""
          />
          <div className="desktop-scene-shade" />

          <div className="home-opening-layer">
            <img
              className="home-theme-title"
              src="/assets/home/portfolio-title.png"
              alt="Jean's world Portfolio"
            />
            <button
              type="button"
              className="home-loading-card"
              onClick={startHomeIntro}
              aria-label={language === "zh" ? "进入 Jean 的作品集" : "Enter Jean's portfolio"}
            >
              <span className="home-loading-copy">
                <strong>LOADING JEAN&apos;S WORLD</strong>
                <small>{language === "zh" ? "准备完成，点击进入" : "Ready — click to enter"}</small>
              </span>
              <span className="home-loading-progress" aria-hidden="true">
                <i />
              </span>
              <span className="home-loading-ok">OK</span>
            </button>
          </div>

          <div className="desktop-hero-copy">
            <h1>
              <SmokyText text={text.heroTitle} active={homePhase !== "loading"} />
            </h1>
            <div className="desktop-hero-meta">
              <p>{text.heroKicker}</p>
              <button type="button" onClick={() => scrollToScene(1)}>
                <ArrowDown weight="bold" />
                {text.explore}
              </button>
            </div>
          </div>

          {introOpen && (
            <DesktopWindow
              title="WELCOME.TXT"
              className="desktop-intro-window"
              zIndex={windowZ("intro")}
              onFocus={() => setTopWindow("intro")}
              onClose={closeIntroWindow}
            >
              <div className="desktop-intro-content">
                <div>
                  <span className="desktop-window-label">HELLO, VISITOR!</span>
                  <h2>{text.introTitle}</h2>
                  <p>{text.introBody}</p>
                </div>
                <div className="desktop-video">
                  <video
                    ref={videoRef}
                    src="/assets/home/luobogou-opening.mp4"
                    poster="/assets/home/intro-background.png"
                    preload="none"
                    muted={muted}
                    playsInline
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    onLoadedMetadata={(event) => {
                      const video = event.currentTarget;
                      setVideoProgress(video.duration ? video.currentTime / video.duration : 0);
                    }}
                    onTimeUpdate={(event) => {
                      const video = event.currentTarget;
                      setVideoProgress(video.duration ? video.currentTime / video.duration : 0);
                    }}
                    onEnded={() => {
                      setVideoPlaying(false);
                      setVideoProgress(1);
                      setChatOpen(true);
                      setTopWindow("chat");
                    }}
                  />
                  <div className="desktop-video-controls">
                    <button
                      type="button"
                      onClick={toggleVideo}
                      aria-label={videoPlaying ? "Pause opening animation" : "Play opening animation"}
                      aria-pressed={videoPlaying}
                    >
                      {videoPlaying ? <Pause weight="fill" /> : <Play weight="fill" />}
                    </button>
                    <span>
                      <i style={{ width: `${Math.round(videoProgress * 100)}%` }} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setMuted((current) => !current)}
                      aria-label="Mute or unmute"
                    >
                      {muted ? <SpeakerSlash weight="fill" /> : <SpeakerHigh weight="fill" />}
                    </button>
                  </div>
                </div>
              </div>
            </DesktopWindow>
          )}

          {chatOpen && (
            <DesktopWindow
              title="RADDIE_CHAT.EXE"
              className="desktop-chat-window"
              zIndex={windowZ("chat")}
              onFocus={() => setTopWindow("chat")}
              onClose={() => setChatOpen(false)}
            >
              <div className="pet-chat-panel">
                <div className="pet-chat-status">
                  <ChatCircleDots weight="fill" />
                  <strong>{text.chatTitle}</strong>
                  <i aria-hidden="true" />
                </div>
                <div className="pet-chat-messages">
                  {messages.map((message, index) => (
                    <p
                      key={`${message}-${index}`}
                      className={index % 3 === 1 ? "is-user" : ""}
                    >
                      {message}
                    </p>
                  ))}
                </div>
                <div className="pet-chat-input">
                  <input
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") sendMessage();
                    }}
                    placeholder={text.chatPlaceholder}
                    aria-label={text.chatPlaceholder}
                  />
                  <button type="button" onClick={sendMessage} aria-label="Send message">
                    <ArrowUpRight weight="bold" />
                  </button>
                </div>
              </div>
            </DesktopWindow>
          )}

          {musicOpen && (
            <DesktopWindow
              title="RADDIE_RADIO.WAV"
              className="desktop-music-window"
              zIndex={windowZ("music")}
              onFocus={() => setTopWindow("music")}
              onClose={() => setMusicOpen(false)}
            >
              <MusicPlayer />
            </DesktopWindow>
          )}

          <div className="desktop-icon-stack desktop-icon-stack-home">
            <button
              type="button"
              className={introOpen ? "is-open" : ""}
              disabled={homePhase === "loading"}
              onClick={reopenIntroWindow}
            >
              <span><House weight="fill" /></span>
              <small>WELCOME</small>
            </button>
            <button
              type="button"
              className={chatOpen ? "is-open" : ""}
              disabled={homePhase === "loading"}
              onClick={() => {
                setChatOpen(true);
                setTopWindow("chat");
              }}
            >
              <span><ChatCircleDots weight="fill" /></span>
              <small>CHAT</small>
            </button>
            <button
              type="button"
              className={musicOpen ? "is-open" : ""}
              disabled={homePhase === "loading"}
              onClick={() => {
                setMusicOpen(true);
                setTopWindow("music");
              }}
            >
              <span><MusicNotes weight="fill" /></span>
              <small>MUSIC</small>
            </button>
          </div>
        </section>

        <section
          id="about"
          className={`desktop-scene desktop-scene-about ${activeScene === 1 ? "is-active-scene" : ""}`}
          data-scene="about"
        >
          <img
            className="desktop-scene-bg"
            src="/assets/ip/luobogou/scenes/country-street.png"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div className="desktop-scene-shade" />
          <div className="desktop-section-heading about-heading is-light">
            <p>{text.aboutKicker}</p>
          </div>

          <div ref={aboutBoardRef} className="about-canvas" aria-label="Draggable personal felt board">
            <div className="about-board-content">
            <DraggableCard
              className="about-intro-card"
              label={text.introHeading}
              zIndex={cardZ("intro")}
              onFocus={() => setTopCard("intro")}
              boundaryRef={aboutBoardRef}
            >
              <small>PROFILE / 01</small>
              <h3>{text.introHeading}</h3>
              <p>{text.introCopy}</p>
              <div className="about-role-tags" aria-label="Jean's design focus">
                <span>Growth</span>
                <span>AI Product</span>
                <span>Research</span>
              </div>
            </DraggableCard>

            <DraggableCard
              className="about-profile-card"
              label="Jean profile"
              zIndex={cardZ("profile")}
              onFocus={() => setTopCard("profile")}
              boundaryRef={aboutBoardRef}
            >
              <img src="/assets/home/about/jean-portrait.png" alt="Jean" loading="lazy" decoding="async" />
            </DraggableCard>

            <DraggableCard
              className="about-experience-card"
              label={text.experienceHeading}
              zIndex={cardZ("experience")}
              onFocus={() => setTopCard("experience")}
              boundaryRef={aboutBoardRef}
            >
              <span>EXPERIENCE.LOG</span>
              <div className="about-card-heading">
                <h3>{text.experienceHeading}</h3>
                <small>04 YEARS / GROWTH + AI</small>
              </div>
              <div className="about-experience-list">
                <section>
                  <time>2026.03 — 2026.05</time>
                  <strong>Alibaba Lazada · UX Designer</strong>
                  <p>{language === "zh" ? "互动玩法UX设计、用户增长活动设计与AI工作流探索。" : "Interactive growth products, campaign design, and AI workflow exploration."}</p>
                </section>
                <section>
                  <time>2023.07 — 2025.10</time>
                  <strong>Pinduoduo TEMU · UX Designer</strong>
                  <p>{language === "zh" ? "负责跨境电商增长体验，覆盖 Credit Back、Win Credit、Balance与大促活动。" : "Growth experiences across Credit Back, Win Credit, Balance, and major campaigns."}</p>
                </section>
                <section>
                  <time>2022.06-2022.10</time>
                  <strong>OPPO · User Research Analyst</strong>
                  <p>{language === "zh" ? "实验设计、用户研究与统计分析，研究成果应用于 Find X5 系列。" : "Experimental design, user research, and statistical analysis for the Find X5 series."}</p>
                </section>
              </div>
            </DraggableCard>

            <DraggableCard
              className="about-education-card"
              label={text.educationHeading}
              zIndex={cardZ("education")}
              onFocus={() => setTopCard("education")}
              boundaryRef={aboutBoardRef}
            >
              <span>EDUCATION.LOG</span>
              <h3>{text.educationHeading}</h3>
              <p>
                <b>2020—2023</b>
                {language === "zh"
                  ? " 湖南大学 · 艺术设计硕士"
                  : " Hunan University · MA, Art & Design"}
              </p>
              <p>
                <b>2013—2017</b>
                {language === "zh"
                  ? " 南华大学 · 视觉传达设计本科"
                  : " University of South China · BA, Visual Communication"}
              </p>
            </DraggableCard>

            <DraggableCard
              className="about-ip-card"
              label={text.ipHeading}
              zIndex={cardZ("ip")}
              onFocus={() => setTopCard("ip")}
              boundaryRef={aboutBoardRef}
            >
              <small>STORY IP / RADDIE</small>
              <h3>{text.ipHeading}</h3>
              <p>{text.ipCopy}</p>
            </DraggableCard>

            <DraggableCard
              className="about-design-card"
              label={text.designHeading}
              zIndex={cardZ("design")}
              onFocus={() => setTopCard("design")}
              boundaryRef={aboutBoardRef}
            >
              <Star weight="fill" />
              <small>DESIGN NOTE / 03</small>
              <p>{text.designCopy}</p>
            </DraggableCard>

            <DraggableCard
              className="about-scene-decoration about-felt-star"
              label="Yellow felt star decoration"
              zIndex={cardZ("felt-star")}
              onFocus={() => setTopCard("felt-star")}
              boundaryRef={aboutBoardRef}
              boundaryPadding={0}
            >
              <img className="about-felt-star-base" src="/assets/home/about/felt-star.png" alt="Yellow felt star" loading="lazy" decoding="async" />
            </DraggableCard>

            <DraggableCard
              className="about-scene-decoration about-raddie-medallion"
              label="Raddie felt medallion decoration"
              zIndex={cardZ("raddie-medallion")}
              onFocus={() => setTopCard("raddie-medallion")}
              boundaryRef={aboutBoardRef}
              boundaryPadding={0}
            >
              <img src="/assets/home/about/raddie-medallion.png" alt="Raddie felt medallion" loading="lazy" decoding="async" />
            </DraggableCard>

            <DraggableCard
              className="about-scene-decoration about-radish-badge"
              label="Radish felt badge decoration"
              zIndex={cardZ("radish-badge")}
              onFocus={() => setTopCard("radish-badge")}
              boundaryRef={aboutBoardRef}
              boundaryPadding={0}
            >
              <img src="/assets/home/about/radish-badge.png" alt="Radish felt badge" loading="lazy" decoding="async" />
            </DraggableCard>
            </div>
          </div>

          {messageVisible && (
            <DesktopWindow
              title={text.messageTitle}
              className="about-message-window"
              zIndex={windowZ("message")}
              onFocus={() => setTopWindow("message")}
              onClose={() => setMessageOpen(false)}
            >
              <div className="guestbook-content">
                <div className="guestbook-notes">
                  {guestMessages.map((message, index) => (
                    <p key={`${message}-${index}`}>{message}</p>
                  ))}
                </div>
                <div className="guestbook-form">
                  <input
                    value={guestInput}
                    onChange={(event) => setGuestInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") sendGuestMessage();
                    }}
                    placeholder={text.messagePlaceholder}
                    aria-label={text.messagePlaceholder}
                  />
                  <button type="button" onClick={sendGuestMessage}>
                    {text.messageSend}
                  </button>
                </div>
              </div>
            </DesktopWindow>
          )}

          <div className="desktop-icon-stack desktop-icon-stack-about">
            <button
              type="button"
              className={messageVisible ? "is-open" : ""}
              onClick={() => {
                setMessageOpen(true);
                setMessageTouched(true);
                setTopWindow("message");
              }}
            >
              <span><ChatCircleDots weight="fill" /></span>
              <small>GUESTBOOK</small>
            </button>
          </div>
        </section>

        <section
          id="work"
          className={`desktop-scene desktop-scene-work ${activeScene === 2 ? "is-active-scene" : ""}`}
          data-scene="work"
        >
          <img
            className="desktop-scene-bg"
            src="/assets/ip/luobogou/scenes/mushroom-forest-night.jpg"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div className="desktop-scene-shade" />
          <div className="desktop-section-heading is-light work-heading">
            <p>{text.workKicker}</p>
            <h2>{text.workTitle}</h2>
            <span>{text.workBody}</span>
          </div>

          {caseOpen && (
            <DesktopWindow
              title={`${selectedCase.index}_${selectedCase.englishTitle.toUpperCase()}.CASE`}
              className="desktop-case-window"
              centered
              topLayer
              visible={activeScene === 2 || workLayerTransitioning}
              zIndex={windowZ("case")}
              onFocus={() => setTopWindow("case")}
              onClose={() => setCaseOpen(false)}
            >
              <InlineCaseDocumentViewer
                key={selectedCase.slug}
                project={selectedCase}
                language={language}
              />
            </DesktopWindow>
          )}

          {motionOpen && (
            <DesktopWindow
              title="MOTION_ARCHIVE.MP4"
              className="desktop-motion-window"
              topLayer
              visible={activeScene === 2 || workLayerTransitioning}
              zIndex={windowZ("motion")}
              onFocus={() => setTopWindow("motion")}
              onClose={() => setMotionOpen(false)}
            >
              <VideoWorkPreview activities={[...motionActivities]} />
            </DesktopWindow>
          )}

          {mobileDemoOpen && (
            <DesktopWindow
              title="MOBILE_PRODUCT_DEMO.APP"
              className="desktop-mobile-demo-window"
              topLayer
              visible={activeScene === 2 || workLayerTransitioning}
              zIndex={windowZ("mobile-demo")}
              onFocus={() => setTopWindow("mobile-demo")}
              onClose={() => setMobileDemoOpen(false)}
            >
              <MobileDemoPreview
                projects={[...mobileDemoProjects]}
              />
            </DesktopWindow>
          )}

          <div ref={workDockRef} className="desktop-work-dock" aria-label="Case studies">
            {featuredCaseStudies.map((item, index) => (
              <button
                type="button"
                key={item.slug}
                data-work-dock-card
                className={activeCase === index ? "is-active" : ""}
                onClick={() => {
                  setActiveCase(index);
                  setCaseOpen(true);
                  setTopWindow("case");
                }}
                aria-pressed={activeCase === index}
                aria-label={`${language === "zh" ? item.title : item.englishTitle} — ${language === "zh" ? "在当前窗口查看" : "View in current window"}`}
              >
                <span className="desktop-work-thumb">
                <img src={item.covers.square} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="desktop-work-card-copy">
                  <small>{item.index}</small>
                  <strong>{language === "zh" ? item.title : item.englishTitle}</strong>
                </span>
              </button>
            ))}
            <Link href="/lab" className="desktop-lab-entry" data-work-dock-card>
              <span><RocketLaunch weight="fill" /></span>
              <strong>{text.otherWorks}</strong>
              <ArrowUpRight weight="bold" />
            </Link>
          </div>

          <div className="desktop-icon-stack desktop-icon-stack-work">
            <button
              type="button"
              className={caseOpen ? "is-open" : ""}
              onClick={() => {
                setCaseOpen(true);
                setTopWindow("case");
              }}
            >
              <span><Briefcase weight="fill" /></span>
              <small>CASE</small>
            </button>
            <button
              type="button"
              className={motionOpen ? "is-open" : ""}
              onClick={() => {
                setMotionOpen(true);
                setTopWindow("motion");
              }}
            >
              <span><VideoCamera weight="fill" /></span>
              <small>VIDEO</small>
            </button>
            <button
              type="button"
              className={mobileDemoOpen ? "is-open" : ""}
              onClick={() => {
                setMobileDemoOpen(true);
                setTopWindow("mobile-demo");
              }}
            >
              <span><DeviceMobile weight="fill" /></span>
              <small>APP DEMO</small>
            </button>
            <Link href="/lab">
              <span><RocketLaunch weight="fill" /></span>
              <small>AI LAB</small>
            </Link>
          </div>
        </section>

        <section
          id="skills"
          className={`desktop-scene desktop-scene-skills ${
            activeScene === 3 ? "is-active-scene" : ""
          } ${resumeOpen ? "has-resume-window" : ""}`}
          data-scene="skills"
        >
          <img
            className="desktop-scene-bg"
            src="/assets/ip/luobogou/scenes/dream-home.png"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div className="desktop-scene-shade" />
          <div className="desktop-skills-layout">
            <div className="desktop-skill-intro">
              <p className="desktop-skill-kicker">{text.skillsKicker}</p>
              <div className="desktop-skill-title-row">
                <h2>{text.skillsTitle}</h2>
              </div>
              <span className="desktop-skill-summary">{text.skillsBody}</span>
              <div className="desktop-skill-map-block">
                <div className="desktop-skill-map-meta" aria-hidden="true">
                  <span>TOOLS + METHODS</span>
                  <b>{String(text.skillCloud.length).padStart(2, "0")}</b>
                </div>
                <div className="desktop-skill-cloud" aria-label="Selected design skills">
                  {text.skillCloud.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="desktop-skill-board">
              {text.skillGroups.map(([index, title, detail], itemIndex) => (
                <article key={index} className={`desktop-skill-note note-${itemIndex + 1}`}>
                  <span>{index}</span>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </div>

          {resumeOpen && (
            <DesktopWindow
              title={text.resumeTitle}
              className={`desktop-resume-window ${
                resumeView === "document" ? "is-document-view" : "is-overview-view"
              }`}
              visible={activeScene === 3}
              centered
              zIndex={windowZ("resume")}
              onFocus={() => setTopWindow("resume")}
              onClose={() => {
                setResumeOpen(false);
                setResumeView("overview");
              }}
            >
              <div className="desktop-resume-content">
                {resumeView === "overview" ? (
                  <div className="desktop-resume-overview">
                    <div className="desktop-resume-avatar"><User weight="fill" /></div>
                    <p>JEAN</p>
                    <h3>{text.resumeRole}</h3>
                    <span>{text.resumeLine}</span>
                    <div className="desktop-resume-actions">
                      <button type="button" onClick={() => setResumeView("document")}>
                        <FilePdf weight="fill" />
                        {text.resume}
                      </button>
                      <a href="mailto:jeanzhou.design@outlook.com">
                        {text.contact}
                        <ArrowUpRight weight="bold" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="desktop-resume-viewer">
                    <img
                      src="/documents/jean-resume-preview.png"
                      alt={language === "zh" ? "周景完整简历" : "Jean's complete resume"}
                    />
                    <div className="desktop-resume-viewer-actions">
                      <button
                        type="button"
                        onClick={() => setResumeView("overview")}
                        aria-label={language === "zh" ? "返回简历介绍" : "Back to resume overview"}
                        title={language === "zh" ? "返回" : "Back"}
                      >
                        <ArrowLeft weight="bold" />
                      </button>
                      <a
                        href="/documents/jean-resume.pdf"
                        download="周景-简历.pdf"
                        aria-label={language === "zh" ? "下载简历 PDF" : "Download resume PDF"}
                        title={language === "zh" ? "下载简历" : "Download resume"}
                      >
                        <DownloadSimple weight="bold" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </DesktopWindow>
          )}

          <div className="desktop-icon-stack desktop-icon-stack-skills">
            <button
              type="button"
              className={resumeOpen ? "is-open" : ""}
              onClick={() => {
                setResumeOpen(true);
                setResumeView("overview");
                setTopWindow("resume");
              }}
              aria-label={text.resume}
            >
              <span><FilePdf weight="fill" /></span>
              <small>RESUME</small>
            </button>
            <Link href="/lab" aria-label={text.otherWorks}>
              <span><FolderOpen weight="fill" /></span>
              <small>MORE WORK</small>
            </Link>
          </div>

        </section>

        <section
          id="gallery"
          className={`desktop-scene desktop-scene-gallery ${activeScene === 4 ? "is-active-scene" : ""}`}
          data-scene="gallery"
        >
          <div className="gallery-background" aria-hidden="true">
            <div className="gallery-background-stars">
              {galleryStars.map((star, index) => (
                <span
                  key={index}
                  style={{
                    left: star.left,
                    top: star.top,
                    width: star.size,
                    height: star.size,
                    animationDelay: star.delay,
                    animationDuration: star.duration,
                  }}
                />
              ))}
            </div>
          </div>
          <GalleryTunnel images={galleryImages} active={activeScene === 4} />
          <div className="desktop-gallery-shade" />
          <div className="desktop-section-heading is-light gallery-heading">
            <p>{text.galleryKicker}</p>
            <h2>{text.galleryTitle}</h2>
            <span>{text.galleryBody}</span>
          </div>

          <footer className="desktop-footer">
            <span>© 2026 Jean</span>
            <div className="footer-records">
              <a
                className="icp-record-link"
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noreferrer"
              >
                湘ICP备2026037520号-1
              </a>
              <a
                className="police-record-link"
                href="https://beian.mps.gov.cn/#/query/webSearch?code=43010402003137"
                target="_blank"
                rel="noreferrer"
              >
                <img src="/assets/police-record.png" width={18} height={20} alt="" />
                <span>湘公网安备43010402003137号</span>
              </a>
            </div>
            <a href="mailto:jeanzhou.design@outlook.com">jeanzhou.design@outlook.com</a>
          </footer>
        </section>
      </div>
    </main>
  );
}
