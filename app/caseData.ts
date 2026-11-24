export type CaseCollection = "featured" | "more";

export type CaseCoverSet = {
  square: string;
  fourThree: string;
  landscape: string;
  wide: string;
};

export type CaseStudy = {
  slug: string;
  index: string;
  title: string;
  englishTitle: string;
  category: string;
  englishCategory: string;
  year: string;
  image: string;
  covers: CaseCoverSet;
  overviewCover?: string;
  pageBase: string;
  pageCount: number;
  pageOrder?: readonly number[];
  summary: string;
  englishSummary: string;
  tone: string;
  collection: CaseCollection;
};

const coverSet = (
  slug: string,
  fallback = "cover-16x9.png",
): CaseCoverSet => ({
  square: `/cases/projects/${slug}/${
    fallback === "cover-16x9.png" ? "cover-square.png" : fallback
  }`,
  fourThree: `/cases/projects/${slug}/${
    fallback === "cover-16x9.png" ? "cover-4x3.png" : fallback
  }`,
  landscape: `/cases/projects/${slug}/cover-16x9.png`,
  wide: `/cases/projects/${slug}/${
    fallback === "cover-16x9.png" ? "cover-wide.png" : fallback
  }`,
});

export const caseStudies: CaseStudy[] = [
  {
    slug: "credit-activity",
    index: "01",
    title: "Credit 活动",
    englishTitle: "Credit Back / Win Credit",
    category: "增长设计 · 电商活动 · 用户体验",
    englishCategory: "Growth Design · E-commerce · User Experience",
    year: "2025",
    image: "/cases/projects/credit-activity/cover-square.png",
    covers: coverSet("credit-activity"),
    overviewCover: "/cases/projects/credit-activity/cover-free.png",
    pageBase: "/case-pages/v2/credit-activity",
    pageCount: 18,
    summary:
      "围绕 Credit Back 与 Win Credit 两类玩法，梳理用户研究、开团体验、视觉改版与支付链路的持续优化。",
    englishSummary:
      "A complete growth-design case spanning Credit Back and Win Credit, from research and group formation to visual and payment-flow improvements.",
    tone: "tone-forest",
    collection: "featured",
  },
  {
    slug: "balance-activity",
    index: "02",
    title: "Balance 积分活动",
    englishTitle: "Gamified Balance Experience",
    category: "增长设计 · 积分活动 · 体验优化",
    englishCategory: "Growth Design · Rewards · Experience Optimization",
    year: "2024",
    image: "/cases/projects/balance-activity/cover-square.png",
    covers: coverSet("balance-activity"),
    overviewCover: "/cases/projects/balance-activity/cover-free.png",
    pageBase: "/case-pages/v2/balance-activity",
    pageCount: 14,
    summary:
      "从积分价值、上瘾模型与竞品研究出发，完成 Balance 1.0 到 2.0 的获取、使用和情感化体验升级。",
    englishSummary:
      "A Balance 1.0-to-2.0 redesign built from value analysis, habit-loop research, reward acquisition, redemption, and emotional design.",
    tone: "tone-lime",
    collection: "featured",
  },
  {
    slug: "growth-design-archive",
    index: "03",
    title: "增长设计沉淀",
    englishTitle: "Growth Design Archive",
    category: "增长设计 · 游戏化 · 方法沉淀",
    englishCategory: "Growth Design · Gamification · Design Practice",
    year: "2024",
    image: "/cases/projects/growth-design-archive/cover-square.png",
    covers: coverSet("growth-design-archive"),
    overviewCover: "/cases/projects/growth-design-archive/cover-free.png",
    pageBase: "/case-pages/v2/growth-design-archive",
    pageCount: 9,
    summary:
      "整理游戏化营销设计、跨区域适配、增长方法论与 AI 辅助设计素材沉淀，呈现持续复盘后的工作方法。",
    englishSummary:
      "A working archive of gamified commerce patterns, regional adaptation, growth-design methods, and AI-assisted asset practices.",
    tone: "tone-violet",
    collection: "featured",
  },
  {
    slug: "daily-lazcash",
    index: "04",
    title: "Daily LazCash 调研助手",
    englishTitle: "DailyLazCash Research Assistant",
    category: "AI 产品 · 用户研究 · 工作流设计",
    englishCategory: "AI Product · User Research · Workflow Design",
    year: "2025",
    image: "/cases/projects/daily-lazcash/cover-square.png",
    covers: coverSet("daily-lazcash"),
    overviewCover: "/cases/projects/daily-lazcash/cover-free.png",
    pageBase: "/case-pages/v2/daily-lazcash",
    pageCount: 9,
    summary:
      "从问卷前置体系到 AI 洞察工具，分阶段打通多语言反馈采集、归纳、分析和研究结论沉淀。",
    englishSummary:
      "A phased research workflow connecting multilingual feedback collection, synthesis, analysis, and AI-assisted insight generation.",
    tone: "tone-sky",
    collection: "featured",
  },
  {
    slug: "xiaolu-medical",
    index: "05",
    title: "小麓医疗导诊机器人",
    englishTitle: "Xiaolu Medical Guidance Robot",
    category: "服务设计 · 智能硬件 · 交互设计",
    englishCategory: "Service Design · Smart Hardware · Interaction Design",
    year: "2023",
    image: "/cases/projects/xiaolu-medical/cover-square.png",
    covers: coverSet("xiaolu-medical"),
    overviewCover: "/cases/projects/xiaolu-medical/cover-free.png",
    pageBase: "/case-pages/v2/xiaolu-medical",
    pageCount: 14,
    // Existing JPGs use the old PDF numbering. Read them in source PNG order (68–81).
    pageOrder: [1, 2, 3, 4, 6, 5, 8, 9, 10, 11, 7, 14, 13, 12],
    summary:
      "面向医院复杂就诊场景，探索导诊、语音交流、智能问诊、导航与情绪反馈的一体化软硬件体验。",
    englishSummary:
      "An integrated hospital guidance experience spanning voice interaction, triage, navigation, consultation, and emotional feedback.",
    tone: "tone-sky",
    collection: "featured",
  },
  {
    slug: "perxio-research",
    index: "04",
    title: "派研 · AI 调研助手",
    englishTitle: "Perxio Research Assistant",
    category: "AI 产品 · 研究工具 · 原型实践",
    englishCategory: "AI Product · Research Tool · Prototype Practice",
    year: "2026",
    image: "/cases/projects/perxio-research/cover-square.png",
    covers: coverSet("perxio-research"),
    pageBase: "/case-pages/v2/perxio-research",
    pageCount: 9,
    summary:
      "由 Daily LazCash 调研流程继续演化的 AI 研究工具尝试，聚焦研究输入、洞察生成与产品化工作流。",
    englishSummary:
      "An AI research-tool exploration evolved from the Daily LazCash workflow, focused on research inputs, insight generation, and productization.",
    tone: "tone-lime",
    collection: "more",
  },
  {
    slug: "hapopus-haptics",
    index: "06",
    title: "HapOpus 振动设计工具",
    englishTitle: "HapOpus Haptic Design Tool",
    category: "用户研究 · 触感体验 · 工具设计",
    englishCategory: "User Research · Haptic Experience · Tool Design",
    year: "2022",
    image: "/cases/projects/hapopus-haptics/cover-thumb.png",
    covers: coverSet("hapopus-haptics", "cover-thumb.png"),
    pageBase: "/case-pages/v2/hapopus-haptics",
    pageCount: 8,
    summary:
      "从人因与设备振动感知研究出发，形成用户画像、体验地图、低保真原型与 HapOpus 触感设计工具。",
    englishSummary:
      "A haptic-experience study translated into personas, journey mapping, low-fidelity prototyping, and the HapOpus design tool.",
    tone: "tone-aqua",
    collection: "more",
  },
  {
    slug: "dance-plus",
    index: "07",
    title: "Dance+ 舞蹈家",
    englishTitle: "Connected Dance Experience",
    category: "多端体验 · 交互设计 · 视觉设计",
    englishCategory: "Cross-device Experience · Interaction · Visual Design",
    year: "2021",
    image: "/cases/projects/dance-plus/cover-square.png",
    covers: coverSet("dance-plus"),
    pageBase: "/case-pages/v2/dance-plus",
    pageCount: 18,
    summary:
      "连接手机、电视与手表的家庭舞蹈体验，让练习、内容发现、设备协同和分享自然发生。",
    englishSummary:
      "A connected home-dance experience across mobile, television, and watch, spanning practice, discovery, coordination, and sharing.",
    tone: "tone-violet",
    collection: "more",
  },
  {
    slug: "wildsit-game",
    index: "08",
    title: "西特公园 · 野生动物保护计划",
    englishTitle: "Wildsit Nature Learning Game",
    category: "游戏化设计 · 插画 · 儿童体验",
    englishCategory: "Game Design · Illustration · Children’s Experience",
    year: "2020",
    image: "/cases/projects/wildsit-game/cover-thumb.png",
    covers: coverSet("wildsit-game", "cover-thumb.png"),
    pageBase: "/case-pages/v2/wildsit-game",
    pageCount: 8,
    summary:
      "将动物认知、探索任务与轻量收集结合，在角色、地图、图鉴和成长系统中完成自然科普体验。",
    englishSummary:
      "A nature-learning game combining animal discovery, guided exploration, collection, and progression across maps and field guides.",
    tone: "tone-aqua",
    collection: "more",
  },
];

export const featuredCaseStudies = caseStudies.filter(
  (item) => item.collection === "featured",
);

export const moreCaseStudies = caseStudies.filter(
  (item) => item.collection === "more",
);

export function getCaseStudy(slug: string) {
  return caseStudies.find((item) => item.slug === slug);
}

export function getCasePageSources({ pageBase, pageCount, pageOrder }: CaseStudy) {
  const order = pageOrder ?? Array.from({ length: pageCount }, (_, index) => index + 1);
  return order.map((page) => `${pageBase}/page-${String(page).padStart(2, "0")}.jpg`);
}
