"use client";

import {
  ArrowsOut,
  ArrowsOutSimple,
  CaretLeft,
  CaretRight,
  FilePdf,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Minus,
  SidebarSimple,
  Square,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { PortfolioLanguage } from "../../usePortfolioLanguage";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type ResizableDocumentWindowProps = {
  image: string;
  previewPages: readonly string[];
  slug: string;
  title: string;
  language: PortfolioLanguage;
};

export function ResizableDocumentWindow({
  image,
  previewPages,
  slug,
  title,
  language,
}: ResizableDocumentWindowProps) {
  const isChinese = language === "zh";
  const windowRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const resizeState = useRef<{
    pointerId: number;
    startHeight: number;
    startWidth: number;
    startX: number;
    startY: number;
  } | null>(null);
  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    windowX: number;
    windowY: number;
  } | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [thumbnailsOpen, setThumbnailsOpen] = useState(true);
  const [manualSize, setManualSize] = useState<{
    height?: number;
    width?: number;
  }>({});
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === windowRef.current);
    };
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 720px)");
    const applyCompactReadingLayout = () => {
      if (compactQuery.matches) {
        setThumbnailsOpen(false);
        setZoom(80);
      }
    };

    applyCompactReadingLayout();
    compactQuery.addEventListener("change", applyCompactReadingLayout);
    return () => compactQuery.removeEventListener("change", applyCompactReadingLayout);
  }, []);

  const selectPage = (index: number) => {
    setActivePage(Math.min(previewPages.length - 1, Math.max(0, index)));
    canvasRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeZoom = (delta: number) => {
    setZoom((current) => Math.min(200, Math.max(50, current + delta)));
  };

  const toggleFullscreen = async () => {
    const frame = windowRef.current;
    if (!frame) return;
    if (isFullscreen) {
      setIsFullscreen(false);
      if (document.fullscreenElement === frame) {
        await document.exitFullscreen();
      }
      return;
    }
    setIsFullscreen(true);
    try {
      await frame.requestFullscreen();
    } catch {
      // The fixed-position fallback keeps the viewer full-screen when the
      // browser blocks the native Fullscreen API (for example in an iframe).
    }
  };

  const navigatePagesWithKeyboard = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      selectPage(activePage - 1);
      event.preventDefault();
    }
    if (event.key === "ArrowRight" || event.key === "PageDown") {
      selectPage(activePage + 1);
      event.preventDefault();
    }
    if (event.key === "Home") {
      selectPage(0);
      event.preventDefault();
    }
    if (event.key === "End") {
      selectPage(previewPages.length - 1);
      event.preventDefault();
    }
  };

  const clampWindowPosition = (x: number, y: number) => {
    const frame = windowRef.current;
    const stage = frame?.parentElement;
    if (!frame || !stage) return { x, y };

    const stageBounds = stage.getBoundingClientRect();
    const frameBounds = frame.getBoundingClientRect();
    const horizontalRoom =
      Math.max(24, (stageBounds.width - frameBounds.width) / 2) +
      stageBounds.width * 0.1;

    return {
      x: Math.min(horizontalRoom, Math.max(-horizontalRoom, x)),
      y: Math.min(180, Math.max(-120, y)),
    };
  };

  const startMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      isMaximized ||
      (event.target as HTMLElement).closest("button, a")
    ) {
      return;
    }

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      windowX: windowPosition.x,
      windowY: windowPosition.y,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const moveWindow = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (!state || state.pointerId !== event.pointerId) return;
    setWindowPosition(
      clampWindowPosition(
        state.windowX + event.clientX - state.startX,
        state.windowY + event.clientY - state.startY,
      ),
    );
  };

  const stopMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const moveWithKeyboard = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (
      isMaximized ||
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      return;
    }

    const step = event.shiftKey ? 40 : 16;
    setWindowPosition((current) =>
      clampWindowPosition(
        current.x +
          (event.key === "ArrowLeft"
            ? -step
            : event.key === "ArrowRight"
              ? step
              : 0),
        current.y +
          (event.key === "ArrowUp"
            ? -step
            : event.key === "ArrowDown"
              ? step
              : 0),
      ),
    );
    event.preventDefault();
  };

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const frame = windowRef.current;
    if (!frame || isMaximized) return;

    const bounds = frame.getBoundingClientRect();
    resizeState.current = {
      pointerId: event.pointerId,
      startHeight: bounds.height,
      startWidth: bounds.width,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const resizeWindow = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const state = resizeState.current;
    const frame = windowRef.current;
    if (!state || !frame || state.pointerId !== event.pointerId) return;

    const stageWidth =
      frame.parentElement?.getBoundingClientRect().width ?? state.startWidth;
    const isCompact = window.matchMedia("(max-width: 720px)").matches;
    const minWidth = Math.min(isCompact ? 280 : 560, stageWidth);
    const nextWidth = Math.min(
      stageWidth,
      Math.max(minWidth, state.startWidth + event.clientX - state.startX),
    );
    const nextHeight = Math.min(
      1080,
      Math.max(420, state.startHeight + event.clientY - state.startY),
    );

    setManualSize({ width: nextWidth, height: nextHeight });
  };

  const stopResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (resizeState.current?.pointerId !== event.pointerId) return;
    resizeState.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const resizeWithKeyboard = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      return;
    }

    const frame = windowRef.current;
    if (!frame || isMaximized) return;
    const bounds = frame.getBoundingClientRect();
    const stageWidth =
      frame.parentElement?.getBoundingClientRect().width ?? bounds.width;
    const isCompact = window.matchMedia("(max-width: 720px)").matches;
    const minWidth = Math.min(isCompact ? 280 : 560, stageWidth);
    const step = event.shiftKey ? 48 : 24;
    const widthChange =
      event.key === "ArrowLeft"
        ? -step
        : event.key === "ArrowRight"
          ? step
          : 0;
    const heightChange =
      event.key === "ArrowUp"
        ? -step
        : event.key === "ArrowDown"
          ? step
          : 0;

    setManualSize({
      width: Math.min(
        stageWidth,
        Math.max(minWidth, bounds.width + widthChange),
      ),
      height: Math.min(1080, Math.max(420, bounds.height + heightChange)),
    });
    event.preventDefault();
  };

  return (
    <div className="document-stage">
      <section
        ref={windowRef}
        className={[
          "document-window",
          isMinimized ? "is-minimized" : "",
          isMaximized ? "is-maximized" : "",
          isFullscreen ? "is-browser-fullscreen" : "",
          isDragging ? "is-dragging" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          isMaximized
            ? undefined
            : {
                ...manualSize,
                transform: `translate3d(${windowPosition.x}px, ${windowPosition.y}px, 0)`,
              }
        }
        data-case={slug}
        aria-label={`${title} ${isChinese ? "案例展示窗口" : "case-study window"}`}
      >
        <div
          className="document-titlebar"
          role="toolbar"
          aria-label={isChinese ? "拖动案例窗口" : "Move case-study window"}
          tabIndex={0}
          onPointerDown={startMove}
          onPointerMove={moveWindow}
          onPointerUp={stopMove}
          onPointerCancel={stopMove}
          onKeyDown={moveWithKeyboard}
        >
          <span className="document-title">
            <FilePdf weight="fill" aria-hidden="true" />
            <b>
              {previewPages.length > 0
                ? "CASE-STUDY.PREVIEW"
                : "PROJECT-PREVIEW.PNG"}
            </b>
            <i>— {title}</i>
          </span>

          <div
            className="document-controls"
            aria-label={isChinese ? "窗口控制" : "Window controls"}
          >
            <button
              type="button"
              aria-label={
                isChinese
                  ? isMinimized
                    ? "展开展示窗口"
                    : "最小化展示窗口"
                  : isMinimized
                    ? "Expand window"
                    : "Minimize window"
              }
              onClick={() => setIsMinimized((value) => !value)}
            >
              <Minus weight="bold" />
            </button>
            <button
              type="button"
              aria-label={
                isChinese
                  ? isMaximized
                    ? "还原展示窗口"
                    : "最大化展示窗口"
                  : isMaximized
                    ? "Restore window"
                    : "Maximize window"
              }
              onClick={() => {
                setIsMinimized(false);
                setIsMaximized((value) => !value);
              }}
            >
              <Square weight="regular" />
            </button>
            <Link
              href="/#work"
              aria-label={
                isChinese
                  ? "关闭案例并返回作品列表"
                  : "Close case study and return to work"
              }
            >
              <X weight="bold" />
            </Link>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div
              className="document-menu"
              aria-label={isChinese ? "展示窗口菜单" : "Document menu"}
            >
              <span className="document-view-only">
                <FilePdf weight="fill" />
                {isChinese ? "仅供查阅" : "VIEW ONLY"}
              </span>
              {previewPages.length > 0 && (
                <button
                  type="button"
                  className="document-thumbnail-toggle"
                  aria-pressed={thumbnailsOpen}
                  onClick={() => setThumbnailsOpen((value) => !value)}
                >
                  <SidebarSimple weight="bold" />
                  {isChinese ? "缩略图" : "PAGES"}
                </button>
              )}
              <button
                type="button"
                className="document-window-toggle"
                onClick={() => setIsMaximized((value) => !value)}
              >
                {isMaximized
                  ? isChinese
                    ? "还原窗口"
                    : "RESTORE"
                  : isChinese
                    ? "放大窗口"
                    : "MAXIMIZE"}
              </button>
              <div className="document-zoom-controls" aria-label={isChinese ? "PDF 缩放" : "PDF zoom"}>
                <button
                  type="button"
                  onClick={() => changeZoom(-25)}
                  disabled={zoom <= 50}
                  aria-label={isChinese ? "缩小 PDF" : "Zoom out PDF"}
                >
                  <MagnifyingGlassMinus weight="bold" />
                </button>
                <output>{zoom}%</output>
                <button
                  type="button"
                  onClick={() => changeZoom(25)}
                  disabled={zoom >= 200}
                  aria-label={isChinese ? "放大 PDF" : "Zoom in PDF"}
                >
                  <MagnifyingGlassPlus weight="bold" />
                </button>
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-pressed={isFullscreen}
              >
                <ArrowsOut weight="bold" />
                {isFullscreen
                  ? isChinese
                    ? "退出全屏"
                    : "EXIT FULLSCREEN"
                  : isChinese
                    ? "全屏"
                    : "FULLSCREEN"}
              </button>
            </div>

            <div className="document-canvas" ref={canvasRef}>
              {previewPages.length > 0 ? (
                <div
                  className={`document-pdf-viewer ${thumbnailsOpen ? "has-thumbnails" : "is-thumbnails-collapsed"}`}
                  aria-label={`${title} ${
                    isChinese ? "案例页面预览" : "case-study page preview"
                  }`}
                >
                  <aside className="document-thumbnail-rail" aria-label={isChinese ? "PDF 页面缩略图" : "PDF page thumbnails"}>
                    {previewPages.map((page, index) => (
                      <button
                        key={page}
                        type="button"
                        className={activePage === index ? "is-active" : ""}
                        onClick={() => selectPage(index)}
                        aria-label={isChinese ? `查看第 ${index + 1} 页` : `View page ${index + 1}`}
                        aria-current={activePage === index ? "page" : undefined}
                      >
                        <img src={page} alt="" loading={index < 3 ? "eager" : "lazy"} decoding="async" />
                        <span>{String(index + 1).padStart(2, "0")}</span>
                      </button>
                    ))}
                  </aside>
                  <div
                    className="document-page-viewport"
                    tabIndex={0}
                    onKeyDown={navigatePagesWithKeyboard}
                  >
                    <img
                      className="document-active-page"
                      key={previewPages[activePage]}
                      src={previewPages[activePage]}
                      alt={`${title} ${isChinese ? `第 ${activePage + 1} 页` : `page ${activePage + 1}`}`}
                      style={{ width: `${zoom}%` }}
                      decoding="async"
                    />
                    <div className="document-page-controls">
                      <button
                        type="button"
                        disabled={activePage === 0}
                        onClick={() => selectPage(activePage - 1)}
                        aria-label={isChinese ? "上一页" : "Previous page"}
                      >
                        <CaretLeft weight="bold" />
                      </button>
                      <span>{activePage + 1} / {previewPages.length}</span>
                      <button
                        type="button"
                        disabled={activePage === previewPages.length - 1}
                        onClick={() => selectPage(activePage + 1)}
                        aria-label={isChinese ? "下一页" : "Next page"}
                      >
                        <CaretRight weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  className="case-detail-image"
                  src={image}
                  alt={`${title} ${isChinese ? "项目预览" : "project preview"}`}
                />
              )}
            </div>

            <div className="document-status">
              <span>{isChinese ? "已就绪" : "READY"}</span>
              <span>
                {previewPages.length > 0
                  ? isChinese
                    ? `第 ${activePage + 1} / ${previewPages.length} 页 · ${zoom}% · 站内预览`
                    : `PAGE ${activePage + 1} / ${previewPages.length} · ${zoom}% · IN-SITE PREVIEW`
                  : isChinese
                    ? "拖动标题栏移动 · 拖动右下角缩放"
                    : "DRAG TITLE TO MOVE · CORNER TO RESIZE"}
              </span>
            </div>
            <button
              className="document-resize-handle"
              type="button"
              aria-label={
                isChinese ? "拖拽调整展示窗口大小" : "Resize document window"
              }
              title={
                isChinese
                  ? "拖拽调整窗口大小；双击恢复默认尺寸"
                  : "Drag to resize; double-click to restore the default size"
              }
              onDoubleClick={() => setManualSize({})}
              onPointerDown={startResize}
              onPointerMove={resizeWindow}
              onPointerUp={stopResize}
              onPointerCancel={stopResize}
              onKeyDown={resizeWithKeyboard}
            >
              <ArrowsOutSimple weight="bold" aria-hidden="true" />
            </button>
          </>
        )}
      </section>
    </div>
  );
}
