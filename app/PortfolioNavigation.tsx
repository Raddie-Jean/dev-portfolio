"use client";

import Link from "next/link";
import { ArrowRight, List, X } from "@phosphor-icons/react";
import { useId, useRef, useState } from "react";
import { usePortfolioLanguage } from "./usePortfolioLanguage";

export const portfolioSectionIds = ["home", "about", "work", "skills", "gallery"] as const;

export const portfolioNavigationCopy = {
  zh: { sections: ["首页", "关于", "作品", "能力", "画廊"], contact: "和我聊聊" },
  en: { sections: ["Home", "About", "Work", "Skills", "Gallery"], contact: "Let's talk" },
};

export function PortfolioNavigation({
  activeScene,
  onSceneChange,
}: {
  activeScene?: number;
  onSceneChange?: (index: number) => void;
}) {
  const { language } = usePortfolioLanguage();
  const { sections, contact } = portfolioNavigationCopy[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const homeLabel = language === "zh" ? "返回首页" : "Back to home";
  const navLabel = language === "zh" ? "作品集导航" : "Portfolio navigation";
  const goToScene = (index: number) => {
    setMenuOpen(false);
    onSceneChange?.(index);
  };

  const renderSections = (compact: boolean) => sections.map((label, index) => {
    const selected = activeScene === index;
    const className = selected ? "is-active" : undefined;
    const content = <>{compact && <span aria-hidden="true">0{index + 1}</span>}{label}</>;

    return onSceneChange ? (
      <button key={label} type="button" className={className} aria-current={selected ? "location" : undefined} onClick={() => goToScene(index)}>
        {content}
      </button>
    ) : (
      <Link key={label} href={`/#${portfolioSectionIds[index]}`} prefetch={false} onClick={() => setMenuOpen(false)}>
        {content}
      </Link>
    );
  });

  // eslint-disable-next-line @next/next/no-img-element -- Serve the bundled logo directly with Vinext.
  const logo = <img className="desktop-brand-logo" src="/assets/home/jean-logo.png" alt="" />;

  return (
    <header
      className="desktop-nav"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !menuOpen) return;
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }}
    >
      <div className="desktop-nav-pill">
        {onSceneChange ? (
          <button type="button" className="desktop-brand" onClick={() => goToScene(0)} aria-label={homeLabel}>
            {logo}
          </button>
        ) : (
          <Link href="/" prefetch={false} className="desktop-brand" aria-label={homeLabel}>{logo}</Link>
        )}

        <nav className="desktop-nav-links" aria-label={navLabel}>{renderSections(false)}</nav>

        <div className="desktop-nav-actions">
          <a className="desktop-nav-cta" href="mailto:jeanzhou.design@outlook.com">
            <span>{contact}</span>
            <i aria-hidden="true"><ArrowRight weight="bold" /></i>
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className="desktop-nav-menu-button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            aria-label={language === "zh" ? (menuOpen ? "关闭导航" : "打开导航") : (menuOpen ? "Close navigation" : "Open navigation")}
          >
            {menuOpen ? <X weight="bold" /> : <List weight="bold" />}
          </button>
        </div>

        {menuOpen && <nav id={menuId} className="desktop-mobile-menu" aria-label={navLabel}>{renderSections(true)}</nav>}
      </div>
    </header>
  );
}
