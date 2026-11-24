"use client";

import Link from "next/link";
import { getCasePageSources, type CaseStudy } from "../../caseData";
import { LanguageToggle } from "../../LanguageToggle";
import { usePortfolioLanguage } from "../../usePortfolioLanguage";
import { ResizableDocumentWindow } from "./ResizableDocumentWindow";

export function CasePageClient({
  project,
  relatedProjects,
}: {
  project: CaseStudy;
  relatedProjects: CaseStudy[];
}) {
  const { language, setLanguage } = usePortfolioLanguage();
  const isChinese = language === "zh";

  return (
    <main className="case-page">
      <header className="case-nav">
        <Link href="/" className="case-brand">
          JEAN<sup>®</sup>
        </Link>
        <div className="case-nav-center">
          <span>{isChinese ? "案例档案" : "ARCHIVE"} / {project.index}</span>
          <LanguageToggle
            language={language}
            onChange={setLanguage}
            inverted
          />
        </div>
        <Link href="/#work">{isChinese ? "关闭" : "CLOSE"} ×</Link>
      </header>

      <section className="case-hero">
        <p>{isChinese ? project.category : project.englishCategory}</p>
        <h1 lang={isChinese ? "zh-CN" : "en"}>
          {isChinese ? project.title : project.englishTitle}
        </h1>
        <div className="case-meta">
          <span>{isChinese ? "年份" : "YEAR"} / {project.year}</span>
          <span>{isChinese ? "类型 / 项目案例" : "TYPE / CASE STUDY"}</span>
          <span>{isChinese ? "状态 / 整理中" : "STATUS / CURATING"}</span>
        </div>
      </section>

      <section className="case-summary">
        <span>{isChinese ? "项目概述" : "OVERVIEW"}</span>
        <p lang={isChinese ? "zh-CN" : "en"}>
          {isChinese ? project.summary : project.englishSummary}
        </p>
      </section>

      <ResizableDocumentWindow
        image={project.image}
        previewPages={getCasePageSources(project)}
        slug={project.slug}
        title={isChinese ? project.title : project.englishTitle}
        language={language}
      />

      <nav
        className="next-case"
        aria-label={isChinese ? "其他案例" : "More case studies"}
      >
        {relatedProjects.map((item) => (
          <Link key={item.slug} href={`/work/${item.slug}`}>
            <span>{item.index}</span>
            <strong lang={isChinese ? "zh-CN" : "en"}>
              {isChinese ? item.title : item.englishTitle}
            </strong>
            <i>↗</i>
          </Link>
        ))}
      </nav>

      <footer className="case-footer">
        <Link href="/#work">
          ← {isChinese ? "返回精选作品" : "BACK TO SELECTED WORK"}
        </Link>
        <a
          className="icp-record-link"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
        >
          湘ICP备2026037520号-1
        </a>
        <span>JEAN · PORTFOLIO V.02</span>
      </footer>
    </main>
  );
}
