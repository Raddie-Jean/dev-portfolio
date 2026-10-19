"use client";

/* eslint-disable @next/next/no-img-element -- Gallery images are pre-generated in separate tunnel, thumbnail, and full-view sizes. */

import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type GalleryImage = {
  src: string;
  thumbSrc: string;
  fullSrc: string;
  alt: string;
  label: string;
  width: number;
  height: number;
};

function fitArtwork(aspectRatio: number) {
  const maxWidth = 3.05;
  const maxHeight = 1.9;
  let height = maxHeight;
  let width = height * aspectRatio;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  return { width, height };
}

export function GalleryTunnel({
  images,
  active = false,
}: {
  images: readonly GalleryImage[];
  active?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pressedRef = useRef(false);
  const [activeArtwork, setActiveArtwork] = useState<number | null>(null);

  useEffect(() => {
    if (activeArtwork === null) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveArtwork(null);
      if (event.key === "ArrowLeft") {
        setActiveArtwork((current) =>
          current === null ? null : (current - 1 + images.length) % images.length,
        );
      }
      if (event.key === "ArrowRight") {
        setActiveArtwork((current) =>
          current === null ? null : (current + 1) % images.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeArtwork, images.length]);

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!active || !frame || !canvas || images.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#050713", 8, 35);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 90);
    camera.position.set(0, 0, 1.8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor("#050713", 0.24);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const tunnelWidth = 8.2;
    const tunnelHeight = 5.5;
    const segmentDepth = 2.25;
    const segmentCount = images.length;
    const galleryDepth = segmentCount * segmentDepth;
    const segments: THREE.Group[] = [];
    const artworkGroups: THREE.Group[] = [];
    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();
    const accentPalette = ["#dfff73", "#efc86c", "#8aa8ff", "#f6e8c8"];
    const verticalOffsets = [-0.82, 0.62, 0.08, 0.92, -0.48];
    const pointer = new THREE.Vector2();
    let pointerInside = false;
    let hoveredArtwork: THREE.Group | null = null;
    let destroyed = false;

    const imageMaterials = images.map((image) => {
      const material = new THREE.MeshBasicMaterial({
        color: "#fffaf0",
        side: THREE.DoubleSide,
      });
      loader.load(image.thumbSrc, (texture) => {
        if (destroyed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        material.map = texture;
        material.needsUpdate = true;
        textures.push(texture);
      });
      disposableMaterials.push(material);
      return material;
    });

    const starGeometry = new THREE.BufferGeometry();
    const starCount = Math.max(110, images.length * 9);
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      starPositions[index * 3] = (Math.random() - 0.5) * (tunnelWidth - 0.7);
      starPositions[index * 3 + 1] = (Math.random() - 0.5) * (tunnelHeight - 0.35);
      starPositions[index * 3 + 2] = -Math.random() * galleryDepth;
    }
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 32;
    starCanvas.height = 32;
    const starContext = starCanvas.getContext("2d");
    if (starContext) {
      const glow = starContext.createRadialGradient(16, 16, 2, 16, 16, 16);
      glow.addColorStop(0, "rgba(255, 255, 255, 1)");
      glow.addColorStop(0.42, "rgba(255, 255, 255, 0.9)");
      glow.addColorStop(1, "rgba(255, 255, 255, 0)");
      starContext.fillStyle = glow;
      starContext.fillRect(0, 0, 32, 32);
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);
    const starMaterial = new THREE.PointsMaterial({
      color: "#fff0bd",
      map: starTexture,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    disposableGeometries.push(starGeometry);
    disposableMaterials.push(starMaterial);
    textures.push(starTexture);

    const createSegment = (index: number) => {
      const group = new THREE.Group();
      group.position.z = -index * segmentDepth;

      const boxGeometry = new THREE.BoxGeometry(
        tunnelWidth,
        tunnelHeight,
        segmentDepth,
      );
      const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: "#8ca7de",
        transparent: true,
        opacity: 0.22,
      });
      group.add(new THREE.LineSegments(edgesGeometry, lineMaterial));
      disposableGeometries.push(boxGeometry, edgesGeometry);
      disposableMaterials.push(lineMaterial);

      const image = images[index];
      const side = index % 2 === 0 ? -1 : 1;
      const artworkSize = fitArtwork(image.width / image.height);
      const artworkGeometry = new THREE.PlaneGeometry(
        artworkSize.width,
        artworkSize.height,
      );
      const frameGeometry = new THREE.PlaneGeometry(
        artworkSize.width + 0.18,
        artworkSize.height + 0.18,
      );
      const frameMaterial = new THREE.MeshBasicMaterial({
        color: "#fff8e7",
        side: THREE.DoubleSide,
      });
      const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
      const imagePlane = new THREE.Mesh(artworkGeometry, imageMaterials[index]);
      const artworkGroup = new THREE.Group();
      const y = verticalOffsets[index % verticalOffsets.length];
      const rotation = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      const baseX = side * (tunnelWidth / 2 - 0.032);

      imagePlane.position.z = 0.014;
      imagePlane.userData.artworkIndex = index;
      artworkGroup.position.set(baseX, y, 0);
      artworkGroup.rotation.y = rotation;
      artworkGroup.userData.baseX = baseX;
      artworkGroup.userData.side = side;
      artworkGroup.userData.artworkIndex = index;
      artworkGroup.userData.artworkWidth = artworkSize.width;
      artworkGroup.userData.artworkHeight = artworkSize.height;
      artworkGroup.add(frameMesh, imagePlane);
      group.add(artworkGroup);
      artworkGroups.push(artworkGroup);
      disposableGeometries.push(artworkGeometry, frameGeometry);
      disposableMaterials.push(frameMaterial);

      const markerGeometry = new THREE.PlaneGeometry(1.15, 0.1);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: accentPalette[index % accentPalette.length],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.78,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(
        -side * (tunnelWidth / 2 - 0.025),
        -verticalOffsets[index % verticalOffsets.length],
        0,
      );
      marker.rotation.y = side < 0 ? -Math.PI / 2 : Math.PI / 2;
      group.add(marker);
      disposableGeometries.push(markerGeometry);
      disposableMaterials.push(markerMaterial);

      scene.add(group);
      segments.push(group);
    };

    for (let index = 0; index < segmentCount; index += 1) {
      createSegment(index);
    }

    const resize = () => {
      const width = Math.max(1, frame.clientWidth);
      const height = Math.max(1, frame.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);
    resize();

    const updatePointer = (event: PointerEvent | MouseEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    };

    const pickArtwork = () => {
      scene.updateMatrixWorld(true);
      let closest: THREE.Group | null = null;
      let closestDepth = Number.POSITIVE_INFINITY;

      for (const artwork of artworkGroups) {
        const width = artwork.userData.artworkWidth as number;
        const height = artwork.userData.artworkHeight as number;
        const corners = [
          new THREE.Vector3(-width / 2, -height / 2, 0.014),
          new THREE.Vector3(width / 2, -height / 2, 0.014),
          new THREE.Vector3(width / 2, height / 2, 0.014),
          new THREE.Vector3(-width / 2, height / 2, 0.014),
        ].map((corner) => artwork.localToWorld(corner).project(camera));
        const center = artwork
          .localToWorld(new THREE.Vector3(0, 0, 0.014))
          .project(camera);
        if (center.z < -1 || center.z > 1) continue;

        const padding = 0.025;
        const minX = Math.min(...corners.map((corner) => corner.x)) - padding;
        const maxX = Math.max(...corners.map((corner) => corner.x)) + padding;
        const minY = Math.min(...corners.map((corner) => corner.y)) - padding;
        const maxY = Math.max(...corners.map((corner) => corner.y)) + padding;
        if (
          pointer.x >= minX &&
          pointer.x <= maxX &&
          pointer.y >= minY &&
          pointer.y <= maxY &&
          center.z < closestDepth
        ) {
          closest = artwork;
          closestDepth = center.z;
        }
      }

      return closest;
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerInside = true;
      updatePointer(event);
    };

    const onPointerLeave = () => {
      pointerInside = false;
      hoveredArtwork = null;
      canvas.style.cursor = "default";
    };

    const onClick = (event: MouseEvent) => {
      updatePointer(event);
      const artwork = hoveredArtwork ?? pickArtwork();
      if (artwork) setActiveArtwork(artwork.userData.artworkIndex as number);
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("click", onClick);

    let frameId = 0;
    let previousTime = performance.now();
    const animate = (time: number) => {
      const delta = Math.min((time - previousTime) / 16.67, 2);
      previousTime = time;
      const distance = reducedMotion || hoveredArtwork
        ? 0
        : (pressedRef.current ? 0.13 : 0.018) * delta;
      let furthest = Math.min(...segments.map((segment) => segment.position.z));

      for (const segment of segments) {
        segment.position.z += distance;
        if (segment.position.z > 2.8) {
          segment.position.z = furthest - segmentDepth;
          furthest = segment.position.z;
        }
      }

      if (pointerInside) {
        hoveredArtwork = pickArtwork();
        canvas.style.cursor = hoveredArtwork ? "zoom-in" : "default";
      }

      for (const artwork of artworkGroups) {
        const isHovered = artwork === hoveredArtwork;
        const targetScale = isHovered ? 1.2 : 1;
        const baseX = artwork.userData.baseX as number;
        const side = artwork.userData.side as number;
        const targetX = isHovered ? baseX - side * 0.24 : baseX;
        const ease = Math.min(1, 0.16 * delta);
        const scale = THREE.MathUtils.lerp(artwork.scale.x, targetScale, ease);
        artwork.scale.setScalar(scale);
        artwork.position.x = THREE.MathUtils.lerp(artwork.position.x, targetX, ease);
      }

      stars.rotation.z += 0.00006 * delta;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      destroyed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("click", onClick);
      canvas.style.cursor = "default";
      for (const texture of textures) texture.dispose();
      for (const geometry of disposableGeometries) geometry.dispose();
      for (const material of disposableMaterials) material.dispose();
      renderer.dispose();
    };
  }, [active, images]);

  const changeArtwork = (step: number) => {
    setActiveArtwork((current) => {
      if (current === null) return 0;
      return (current + step + images.length) % images.length;
    });
  };

  const selectedArtwork = activeArtwork === null ? null : images[activeArtwork];

  return (
    <div ref={frameRef} className="gallery-tunnel">
      <canvas ref={canvasRef} aria-hidden="true" />

      <button
        type="button"
        className="gallery-boost"
        onPointerDown={(event) => {
          event.stopPropagation();
          pressedRef.current = true;
        }}
        onPointerUp={() => {
          pressedRef.current = false;
        }}
        onPointerLeave={() => {
          pressedRef.current = false;
        }}
      >
        按住穿行
      </button>

      <div className="sr-only" aria-label="Illustration gallery">
        {images.map((image, index) => (
          <button
            type="button"
            key={image.src}
            onClick={() => setActiveArtwork(index)}
            aria-label={`Open ${image.label}`}
          >
            {image.label}
          </button>
        ))}
      </div>

      {selectedArtwork &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedArtwork.label} preview`}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) setActiveArtwork(null);
            }}
          >
            <div className="gallery-lightbox-window">
              <header>
                <span>ILLUSTRATION_VIEWER.EXE</span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setActiveArtwork(null)}
                  aria-label="Close artwork preview"
                >
                  <X weight="bold" />
                </button>
              </header>

              <div className="gallery-lightbox-stage">
                <button
                  type="button"
                  className="gallery-lightbox-arrow is-previous"
                  onClick={() => changeArtwork(-1)}
                  aria-label="Previous artwork"
                >
                  <ArrowLeft weight="bold" />
                </button>
                <figure>
                  <div className="gallery-lightbox-artboard">
                    <img
                      src={selectedArtwork.fullSrc}
                      alt={selectedArtwork.alt}
                      draggable={false}
                    />
                  </div>
                  <figcaption>
                    <strong>{selectedArtwork.label}</strong>
                    <span>
                      {String(activeArtwork + 1).padStart(2, "0")} / {images.length}
                    </span>
                  </figcaption>
                </figure>
                <button
                  type="button"
                  className="gallery-lightbox-arrow is-next"
                  onClick={() => changeArtwork(1)}
                  aria-label="Next artwork"
                >
                  <ArrowRight weight="bold" />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
